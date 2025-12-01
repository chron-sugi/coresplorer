#!/usr/bin/env python3
"""
Unit tests for graph traversal functions in generate.py

Tests cover:
- build_graph_structures: Building bidirectional adjacency lists
- collect_transitive_edges: BFS traversal with cycle handling
- collect_all_edges_for_node: Full edge collection for diagram rendering
"""

import sys
from pathlib import Path

# Add src to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

import pytest
from generate import (
    build_graph_structures,
    collect_transitive_edges,
    collect_all_edges_for_node,
)


class TestBuildGraphStructures:
    """Tests for build_graph_structures function."""

    def test_empty_nodes(self):
        """Empty nodes list returns empty dicts."""
        outgoing, incoming = build_graph_structures([])
        assert outgoing == {}
        assert incoming == {}

    def test_single_node_no_edges(self):
        """Single node with no edges."""
        nodes = [{"id": "A"}]
        outgoing, incoming = build_graph_structures(nodes)
        assert outgoing == {"A": []}
        assert incoming == {"A": []}

    def test_single_edge(self):
        """Simple A -> B edge."""
        nodes = [
            {"id": "A", "edges": [{"target": "B"}]},
            {"id": "B"},
        ]
        outgoing, incoming = build_graph_structures(nodes)
        assert outgoing == {"A": ["B"], "B": []}
        assert incoming == {"A": [], "B": ["A"]}

    def test_chain_graph(self):
        """Linear chain A -> B -> C."""
        nodes = [
            {"id": "A", "edges": [{"target": "B"}]},
            {"id": "B", "edges": [{"target": "C"}]},
            {"id": "C"},
        ]
        outgoing, incoming = build_graph_structures(nodes)
        assert outgoing == {"A": ["B"], "B": ["C"], "C": []}
        assert incoming == {"A": [], "B": ["A"], "C": ["B"]}

    def test_diamond_graph(self):
        """Diamond shape: A -> B, A -> C, B -> D, C -> D."""
        nodes = [
            {"id": "A", "edges": [{"target": "B"}, {"target": "C"}]},
            {"id": "B", "edges": [{"target": "D"}]},
            {"id": "C", "edges": [{"target": "D"}]},
            {"id": "D"},
        ]
        outgoing, incoming = build_graph_structures(nodes)
        assert outgoing["A"] == ["B", "C"]
        assert outgoing["B"] == ["D"]
        assert outgoing["C"] == ["D"]
        assert outgoing["D"] == []
        assert incoming["A"] == []
        assert incoming["D"] == ["B", "C"]

    def test_multiple_outgoing_edges(self):
        """Node with multiple outgoing edges."""
        nodes = [
            {"id": "hub", "edges": [{"target": "A"}, {"target": "B"}, {"target": "C"}]},
            {"id": "A"},
            {"id": "B"},
            {"id": "C"},
        ]
        outgoing, incoming = build_graph_structures(nodes)
        assert outgoing["hub"] == ["A", "B", "C"]
        assert incoming["A"] == ["hub"]
        assert incoming["B"] == ["hub"]
        assert incoming["C"] == ["hub"]


class TestCollectTransitiveEdges:
    """Tests for collect_transitive_edges function."""

    def test_no_neighbors(self):
        """Node with no neighbors returns empty list."""
        adjacency = {"A": []}
        edges = collect_transitive_edges("A", adjacency, "downstream")
        assert edges == []

    def test_single_downstream_edge(self):
        """Single downstream edge A -> B."""
        adjacency = {"A": ["B"], "B": []}
        edges = collect_transitive_edges("A", adjacency, "downstream")
        assert edges == [("A", "B")]

    def test_chain_downstream(self):
        """Chain traversal A -> B -> C -> D."""
        adjacency = {"A": ["B"], "B": ["C"], "C": ["D"], "D": []}
        edges = collect_transitive_edges("A", adjacency, "downstream")
        assert ("A", "B") in edges
        assert ("B", "C") in edges
        assert ("C", "D") in edges
        assert len(edges) == 3

    def test_chain_upstream(self):
        """Upstream traversal from D back to A."""
        incoming = {"A": [], "B": ["A"], "C": ["B"], "D": ["C"]}
        edges = collect_transitive_edges("D", incoming, "upstream")
        # Upstream edges should still be oriented source -> target
        assert ("A", "B") in edges
        assert ("B", "C") in edges
        assert ("C", "D") in edges
        assert len(edges) == 3

    def test_cycle_handling(self):
        """Cycles don't cause infinite loops."""
        adjacency = {"A": ["B"], "B": ["C"], "C": ["A"]}  # A -> B -> C -> A
        edges = collect_transitive_edges("A", adjacency, "downstream")
        assert len(edges) == 3
        assert ("A", "B") in edges
        assert ("B", "C") in edges
        assert ("C", "A") in edges

    def test_self_loop(self):
        """Self-referencing node."""
        adjacency = {"A": ["A"]}
        edges = collect_transitive_edges("A", adjacency, "downstream")
        assert edges == [("A", "A")]

    def test_diamond_traversal(self):
        """Diamond graph collects all paths."""
        adjacency = {"A": ["B", "C"], "B": ["D"], "C": ["D"], "D": []}
        edges = collect_transitive_edges("A", adjacency, "downstream")
        assert len(edges) == 4
        assert ("A", "B") in edges
        assert ("A", "C") in edges
        assert ("B", "D") in edges
        assert ("C", "D") in edges

    def test_missing_node_in_adjacency(self):
        """Handle nodes not in adjacency dict gracefully."""
        adjacency = {"A": ["B"]}  # B not in adjacency
        edges = collect_transitive_edges("A", adjacency, "downstream")
        assert edges == [("A", "B")]

    def test_complex_graph_with_cycles(self):
        """Complex graph with multiple cycles."""
        # A -> B -> C -> D -> B (cycle)
        #      B -> E
        adjacency = {
            "A": ["B"],
            "B": ["C", "E"],
            "C": ["D"],
            "D": ["B"],
            "E": [],
        }
        edges = collect_transitive_edges("A", adjacency, "downstream")
        assert ("A", "B") in edges
        assert ("B", "C") in edges
        assert ("B", "E") in edges
        assert ("C", "D") in edges
        assert ("D", "B") in edges
        assert len(edges) == 5


class TestCollectAllEdgesForNode:
    """Tests for collect_all_edges_for_node function."""

    def test_isolated_node(self):
        """Isolated node returns empty edges list."""
        outgoing = {"A": []}
        incoming = {"A": []}
        edges = collect_all_edges_for_node("A", outgoing, incoming)
        assert edges == []

    def test_only_downstream(self):
        """Node with only downstream edges."""
        outgoing = {"A": ["B", "C"], "B": [], "C": []}
        incoming = {"A": [], "B": ["A"], "C": ["A"]}
        edges = collect_all_edges_for_node("A", outgoing, incoming)
        assert {"source": "A", "target": "B"} in edges
        assert {"source": "A", "target": "C"} in edges
        assert len(edges) == 2

    def test_only_upstream(self):
        """Node with only upstream edges."""
        outgoing = {"A": ["B"], "B": [], "C": []}
        incoming = {"A": [], "B": ["A"], "C": []}
        edges = collect_all_edges_for_node("B", outgoing, incoming)
        assert {"source": "A", "target": "B"} in edges
        assert len(edges) == 1

    def test_both_directions(self):
        """Node in middle of chain has both upstream and downstream."""
        # A -> B -> C
        outgoing = {"A": ["B"], "B": ["C"], "C": []}
        incoming = {"A": [], "B": ["A"], "C": ["B"]}
        edges = collect_all_edges_for_node("B", outgoing, incoming)
        assert {"source": "A", "target": "B"} in edges
        assert {"source": "B", "target": "C"} in edges
        assert len(edges) == 2

    def test_transitive_downstream(self):
        """Collects transitive downstream edges."""
        # A -> B -> C -> D (selecting A should get all 3 edges)
        outgoing = {"A": ["B"], "B": ["C"], "C": ["D"], "D": []}
        incoming = {"A": [], "B": ["A"], "C": ["B"], "D": ["C"]}
        edges = collect_all_edges_for_node("A", outgoing, incoming)
        assert {"source": "A", "target": "B"} in edges
        assert {"source": "B", "target": "C"} in edges
        assert {"source": "C", "target": "D"} in edges
        assert len(edges) == 3

    def test_transitive_upstream(self):
        """Collects transitive upstream edges."""
        # A -> B -> C -> D (selecting D should get all 3 edges)
        outgoing = {"A": ["B"], "B": ["C"], "C": ["D"], "D": []}
        incoming = {"A": [], "B": ["A"], "C": ["B"], "D": ["C"]}
        edges = collect_all_edges_for_node("D", outgoing, incoming)
        assert {"source": "A", "target": "B"} in edges
        assert {"source": "B", "target": "C"} in edges
        assert {"source": "C", "target": "D"} in edges
        assert len(edges) == 3

    def test_middle_node_collects_all(self):
        """Middle node collects full chain in both directions."""
        # A -> B -> C -> D -> E (selecting C should get all 4 edges)
        outgoing = {"A": ["B"], "B": ["C"], "C": ["D"], "D": ["E"], "E": []}
        incoming = {"A": [], "B": ["A"], "C": ["B"], "D": ["C"], "E": ["D"]}
        edges = collect_all_edges_for_node("C", outgoing, incoming)
        assert len(edges) == 4
        assert {"source": "A", "target": "B"} in edges
        assert {"source": "B", "target": "C"} in edges
        assert {"source": "C", "target": "D"} in edges
        assert {"source": "D", "target": "E"} in edges

    def test_diamond_center(self):
        """Center of diamond graph."""
        # A -> B, A -> C, B -> D, C -> D
        outgoing = {"A": ["B", "C"], "B": ["D"], "C": ["D"], "D": []}
        incoming = {"A": [], "B": ["A"], "C": ["A"], "D": ["B", "C"]}

        # From B's perspective
        edges = collect_all_edges_for_node("B", outgoing, incoming)
        assert {"source": "A", "target": "B"} in edges  # upstream
        assert {"source": "B", "target": "D"} in edges  # downstream
        # Should not include A->C or C->D (not in B's dependency tree)
        assert len(edges) == 2

    def test_hub_node(self):
        """Hub node with many connections."""
        outgoing = {
            "hub": ["A", "B", "C"],
            "A": [],
            "B": [],
            "C": [],
            "X": ["hub"],
            "Y": ["hub"],
        }
        incoming = {
            "hub": ["X", "Y"],
            "A": ["hub"],
            "B": ["hub"],
            "C": ["hub"],
            "X": [],
            "Y": [],
        }
        edges = collect_all_edges_for_node("hub", outgoing, incoming)
        assert len(edges) == 5  # 3 downstream + 2 upstream

    def test_deduplication(self):
        """Edges are deduplicated when paths overlap."""
        # Multiple paths to same node: A -> B -> D, A -> C -> D
        outgoing = {"A": ["B", "C"], "B": ["D"], "C": ["D"], "D": []}
        incoming = {"A": [], "B": ["A"], "C": ["A"], "D": ["B", "C"]}
        edges = collect_all_edges_for_node("A", outgoing, incoming)
        # Should have 4 unique edges, no duplicates
        edge_set = {(e["source"], e["target"]) for e in edges}
        assert len(edge_set) == 4
        assert len(edges) == 4

    def test_edges_sorted(self):
        """Output edges are sorted for deterministic output."""
        outgoing = {"Z": ["Y"], "Y": ["X"], "X": ["A"], "A": []}
        incoming = {"Z": [], "Y": ["Z"], "X": ["Y"], "A": ["X"]}
        edges = collect_all_edges_for_node("Z", outgoing, incoming)
        # Verify sorted order
        sources = [e["source"] for e in edges]
        targets = [e["target"] for e in edges]
        assert sources == sorted(sources) or all(
            (s1, t1) <= (s2, t2)
            for (s1, t1), (s2, t2) in zip(
                [(e["source"], e["target"]) for e in edges],
                [(e["source"], e["target"]) for e in edges[1:]]
            )
        )

    def test_cycle_in_graph(self):
        """Graph with cycle doesn't cause issues."""
        # A -> B -> C -> A (cycle)
        outgoing = {"A": ["B"], "B": ["C"], "C": ["A"]}
        incoming = {"A": ["C"], "B": ["A"], "C": ["B"]}
        edges = collect_all_edges_for_node("A", outgoing, incoming)
        assert len(edges) == 3
        assert {"source": "A", "target": "B"} in edges
        assert {"source": "B", "target": "C"} in edges
        assert {"source": "C", "target": "A"} in edges


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
