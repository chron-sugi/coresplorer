#!/usr/bin/env python3
"""
Synthetic Knowledge Object Generator

Generates synchronized JSON files (index.json, graph.json, and individual {id}.json files)
from YAML source files for CoreSplorer.

Supports:
- Single source file processing (--source)
- Multiple scenario files from scenarios/ directory (default)
- Merging all scenarios into combined graph.json and index.json
"""

import argparse
import json
import sys
from collections import defaultdict, deque
from pathlib import Path
from typing import Any

import yaml


def load_yaml(filepath: Path) -> dict[str, Any]:
    """Load and parse YAML source file."""
    with open(filepath, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def load_all_scenario_files(scenarios_dir: Path, scenario_filter: str | None = None) -> list[dict[str, Any]]:
    """
    Load all YAML files from scenarios directory and merge nodes.
    
    Args:
        scenarios_dir: Path to scenarios directory
        scenario_filter: Optional scenario name to filter (without .yaml extension)
    
    Returns:
        List of all nodes from all scenario files
    """
    all_nodes: list[dict[str, Any]] = []
    
    if not scenarios_dir.exists():
        return all_nodes
    
    yaml_files = sorted(scenarios_dir.glob("*.yaml"))
    
    if scenario_filter:
        yaml_files = [f for f in yaml_files if f.stem == scenario_filter]
        if not yaml_files:
            print(f"Warning: No scenario file found matching '{scenario_filter}'", file=sys.stderr)
            return all_nodes
    
    for yaml_file in yaml_files:
        print(f"  Loading scenario: {yaml_file.name}")
        data = load_yaml(yaml_file)
        if data and "nodes" in data:
            all_nodes.extend(data["nodes"])
    
    return all_nodes


def validate_id_format(node_id: str) -> bool:
    """Validate that ID follows {name}-{app}-{type} pattern."""
    # Pattern: at least 3 segments separated by hyphens
    parts = node_id.split("-")
    return len(parts) >= 3


def validate_nodes(nodes: list[dict[str, Any]]) -> list[str]:
    """Validate all nodes and return list of errors."""
    errors = []
    required_fields = ["id", "label", "type", "app", "owner", "last_modified"]
    valid_types = {"index", "saved_search", "macro", "lookup_def", "lookup_file", "dashboard", "data_model", "event_type"}

    seen_ids = set()
    all_ids = {node["id"] for node in nodes if "id" in node}

    for i, node in enumerate(nodes):
        # Check required fields
        for field in required_fields:
            if field not in node:
                errors.append(f"Node {i}: Missing required field '{field}'")

        if "id" not in node:
            continue

        node_id = node["id"]

        # Check for duplicate IDs
        if node_id in seen_ids:
            errors.append(f"Node '{node_id}': Duplicate ID")
        seen_ids.add(node_id)

        # Validate ID format
        if not validate_id_format(node_id):
            errors.append(f"Node '{node_id}': ID doesn't match {{name}}-{{app}}-{{type}} pattern")

        # Validate type
        if "type" in node and node["type"] not in valid_types:
            errors.append(f"Node '{node_id}': Invalid type '{node['type']}'. Must be one of {valid_types}")

        # Validate edge targets
        edges = node.get("edges", [])
        if edges:
            for edge in edges:
                if "target" not in edge:
                    errors.append(f"Node '{node_id}': Edge missing 'target' field")
                elif edge["target"] not in all_ids:
                    errors.append(f"Node '{node_id}': Edge references non-existent target '{edge['target']}'")

    return errors


def build_reverse_lookup(nodes: list[dict[str, Any]]) -> dict[str, set[str]]:
    """Build reverse lookup: for each node, find which other nodes reference it."""
    reverse_lookup: dict[str, set[str]] = {node["id"]: set() for node in nodes}

    for node in nodes:
        node_id = node["id"]
        edges = node.get("edges", [])
        if edges:
            for edge in edges:
                target = edge["target"]
                if target in reverse_lookup:
                    reverse_lookup[target].add(node_id)

    return reverse_lookup


def build_graph_structures(
    nodes: list[dict[str, Any]]
) -> tuple[dict[str, list[str]], dict[str, list[str]]]:
    """
    Build bidirectional adjacency lists from nodes.

    Returns:
        outgoing: dict mapping node_id -> list of downstream target IDs
        incoming: dict mapping node_id -> list of upstream source IDs
    """
    outgoing: dict[str, list[str]] = defaultdict(list)
    incoming: dict[str, list[str]] = defaultdict(list)

    for node in nodes:
        node_id = node["id"]
        # Ensure node exists in both dicts even if no edges
        if node_id not in outgoing:
            outgoing[node_id] = []
        if node_id not in incoming:
            incoming[node_id] = []

        for edge in node.get("edges", []):
            target = edge["target"]
            outgoing[node_id].append(target)
            incoming[target].append(node_id)

    return dict(outgoing), dict(incoming)


def collect_transitive_edges(
    start_id: str,
    adjacency: dict[str, list[str]],
    direction: str,
) -> list[tuple[str, str]]:
    """
    BFS traversal to collect ALL transitive edges from a starting node.

    Args:
        start_id: The node to start traversal from
        adjacency: Adjacency list (outgoing for downstream, incoming for upstream)
        direction: "downstream" or "upstream" - determines edge orientation

    Returns:
        List of (source, target) tuples representing edges
    """
    edges: list[tuple[str, str]] = []
    visited_edges: set[tuple[str, str]] = set()
    visited_nodes: set[str] = {start_id}
    queue: deque[str] = deque([start_id])

    while queue:
        current_id = queue.popleft()
        neighbors = adjacency.get(current_id, [])

        for neighbor in neighbors:
            # Determine edge direction based on traversal direction
            if direction == "downstream":
                edge = (current_id, neighbor)
            else:  # upstream
                edge = (neighbor, current_id)

            if edge not in visited_edges:
                visited_edges.add(edge)
                edges.append(edge)

            if neighbor not in visited_nodes:
                visited_nodes.add(neighbor)
                queue.append(neighbor)

    return edges


def collect_all_edges_for_node(
    node_id: str,
    outgoing: dict[str, list[str]],
    incoming: dict[str, list[str]],
) -> list[dict[str, str]]:
    """
    Collect ALL edges needed to display the diagram for this node as core.

    Includes:
    - All downstream edges (transitive dependencies)
    - All upstream edges (transitive dependents)

    Returns:
        Deduplicated list of {"source": str, "target": str} edges
    """
    all_edges: set[tuple[str, str]] = set()

    # Collect downstream edges (follow outgoing from this node)
    downstream_edges = collect_transitive_edges(node_id, outgoing, "downstream")
    all_edges.update(downstream_edges)

    # Collect upstream edges (follow incoming to this node)
    upstream_edges = collect_transitive_edges(node_id, incoming, "upstream")
    all_edges.update(upstream_edges)

    # Convert to list of dicts, sorted for deterministic output
    return [{"source": s, "target": t} for s, t in sorted(all_edges)]


def generate_index_json(nodes: list[dict[str, Any]], reverse_lookup: dict[str, set[str]]) -> dict[str, Any]:
    """Generate index.json content."""
    index = {}

    for node in nodes:
        node_id = node["id"]
        edges = node.get("edges", [])
        has_edges = bool(edges)
        has_incoming = bool(reverse_lookup.get(node_id))

        index[node_id] = {
            "label": node["label"],
            "type": node["type"],
            "app": node["app"],
            "owner": node["owner"],
            "isolated": not has_edges and not has_incoming
        }

    return index


def generate_graph_json(
    nodes: list[dict[str, Any]],
    outgoing: dict[str, list[str]],
    incoming: dict[str, list[str]],
) -> dict[str, Any]:
    """
    Generate graph.json content with ALL transitive edges for each node.

    Per diagram-edges.md: The edges array must contain ALL edges to display -
    both direct and indirect dependencies. No graph traversal is performed by
    the diagram - the edges array is the single source of truth.
    """
    graph_nodes = []

    for node in nodes:
        node_id = node["id"]

        # Collect ALL transitive edges for this node as core
        all_edges = collect_all_edges_for_node(node_id, outgoing, incoming)

        graph_nodes.append({
            "id": node_id,
            "label": node["label"],
            "type": node["type"],
            "app": node["app"],
            "owner": node["owner"],
            "last_modified": node["last_modified"],
            "edges": all_edges
        })

    return {
        "version": "1.0.0",
        "nodes": graph_nodes
    }


def generate_object_json(node: dict[str, Any], reverse_lookup: dict[str, set[str]]) -> dict[str, Any]:
    """Generate individual {id}.json content."""
    node_id = node["id"]
    edges = node.get("edges", [])

    return {
        "id": node_id,
        "label": node["label"],
        "type": node["type"],
        "app": node["app"],
        "owner": node["owner"],
        "last_modified": node["last_modified"],
        "spl_code": node.get("spl_code"),
        "upstream_count": len(reverse_lookup.get(node_id, set())),
        "downstream_count": len(edges) if edges else 0
    }


def write_json(filepath: Path, data: Any) -> None:
    """Write JSON data to file with pretty formatting."""
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def main():
    parser = argparse.ArgumentParser(
        description="Generate synthetic Splunk knowledge object JSON files from YAML source."
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path(__file__).parent.parent.parent.parent / "public",
        help="Output directory for generated files (default: ../../public)"
    )
    parser.add_argument(
        "--source",
        type=Path,
        default=None,
        help="Single YAML source file to process (overrides scenario loading)"
    )
    parser.add_argument(
        "--scenario",
        type=str,
        default=None,
        help="Specific scenario name to process (without .yaml extension). If not provided, all scenarios are processed."
    )
    parser.add_argument(
        "--scenarios-dir",
        type=Path,
        default=Path(__file__).parent / "config" / "scenarios",
        help="Directory containing scenario YAML files (default: ./config/scenarios)"
    )
    parser.add_argument(
        "--include-main",
        action="store_true",
        default=True,
        help="Include main synth_graph.yaml in addition to scenarios (default: True)"
    )
    parser.add_argument(
        "--no-include-main",
        action="store_false",
        dest="include_main",
        help="Exclude main synth_graph.yaml, only process scenarios"
    )
    parser.add_argument(
        "--validate-only",
        action="store_true",
        help="Only validate YAML without generating files"
    )

    args = parser.parse_args()

    nodes: list[dict[str, Any]] = []

    # Load nodes from sources
    if args.source:
        # Single source file mode
        if not args.source.exists():
            print(f"Error: Source file not found: {args.source}", file=sys.stderr)
            sys.exit(1)
        print(f"Loading source: {args.source}")
        data = load_yaml(args.source)
        if "nodes" not in data:
            print("Error: YAML must contain 'nodes' key", file=sys.stderr)
            sys.exit(1)
        nodes = data["nodes"]
    else:
        # Scenario-based loading (default)
        print("Loading scenario files...")
        
        # Optionally include main synth_graph.yaml
        if args.include_main:
            main_source = Path(__file__).parent / "config" / "synth_graph.yaml"
            if main_source.exists():
                print(f"  Loading main source: synth_graph.yaml")
                main_data = load_yaml(main_source)
                if main_data and "nodes" in main_data:
                    nodes.extend(main_data["nodes"])
        
        # Load scenarios
        scenario_nodes = load_all_scenario_files(args.scenarios_dir, args.scenario)
        nodes.extend(scenario_nodes)
        
        if not nodes:
            print("Error: No nodes found. Check scenario files exist.", file=sys.stderr)
            sys.exit(1)
    print(f"Found {len(nodes)} nodes")

    # Validate
    print("Validating nodes...")
    errors = validate_nodes(nodes)

    if errors:
        print(f"\nValidation failed with {len(errors)} error(s):", file=sys.stderr)
        for error in errors:
            print(f"  - {error}", file=sys.stderr)
        sys.exit(1)

    print("Validation passed!")

    if args.validate_only:
        print("Validation-only mode, skipping file generation.")
        return

    # Build reverse lookup
    reverse_lookup = build_reverse_lookup(nodes)

    # Build graph structures for transitive edge collection
    outgoing, incoming = build_graph_structures(nodes)

    # Create output directories
    output_dir = args.output_dir
    nodes_dir = output_dir / "nodes"
    nodes_dir.mkdir(parents=True, exist_ok=True)

    # Generate index.json
    print("Generating index.json...")
    index_data = generate_index_json(nodes, reverse_lookup)
    write_json(output_dir / "index.json", index_data)

    # Generate graph.json (with ALL transitive edges per node)
    print("Generating graph.json...")
    graph_data = generate_graph_json(nodes, outgoing, incoming)
    write_json(output_dir / "graph.json", graph_data)

    # Generate individual object files
    print(f"Generating {len(nodes)} individual object files...")
    for node in nodes:
        object_data = generate_object_json(node, reverse_lookup)
        write_json(nodes_dir / f"{node['id']}.json", object_data)

    # Summary statistics
    isolated_count = sum(1 for v in index_data.values() if v["isolated"])
    type_counts = {}
    for node in nodes:
        t = node["type"]
        type_counts[t] = type_counts.get(t, 0) + 1

    print("\n=== Generation Complete ===")
    print(f"Output directory: {output_dir}")
    print(f"Total objects: {len(nodes)}")
    print(f"Isolated objects: {isolated_count}")
    print("Type distribution:")
    for t, count in sorted(type_counts.items()):
        print(f"  - {t}: {count}")

    # Find hub nodes (nodes with high connectivity)
    hub_threshold = 10
    hub_nodes = []
    for node in nodes:
        node_id = node["id"]
        edges = node.get("edges", [])
        upstream = len(reverse_lookup.get(node_id, set()))
        downstream = len(edges) if edges else 0
        total = upstream + downstream
        if total >= hub_threshold:
            hub_nodes.append((node_id, upstream, downstream, total))

    if hub_nodes:
        print(f"\nHub nodes (>= {hub_threshold} connections):")
        for node_id, up, down, total in sorted(hub_nodes, key=lambda x: -x[3]):
            print(f"  - {node_id}: {up} upstream, {down} downstream ({total} total)")


if __name__ == "__main__":
    main()
