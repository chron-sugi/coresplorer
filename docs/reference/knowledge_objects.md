

## 1. Canonical knowledge object types (from Splunk training/docs)

These are the types Splunk explicitly calls out in the *Introduction to Knowledge Objects* course and core docs. ([Splunk][1])

**Data & fields**

1. **Fields** – key/value pairs on events (including default and user-defined fields).
2. **Field extractions** – rules (often regex or delimited) that create fields at search time. ([Dante Cyber][2])
3. **Field aliases** – alternate names that point to the same underlying field. ([Dante Cyber][2])
4. **Calculated fields** – fields whose values are computed from other fields (using `eval`-style expressions). ([Dante Cyber][2])
5. **Lookups** – definitions that enrich events with extra fields by matching to CSV/kvstore/DB/etc. ([Dante Cyber][2])

**Classification & tagging**

6. **Event types** – saved search filters that categorize similar events. ([Splunk Documentation][3])
7. **Tags** – labels applied to field/value pairs or event types (e.g. `tag=authentication`). ([Splunk InfoSec Documentation][4])

**Search, automation & actions**

8. **Saved searches** – reusable searches, often the underlying object for reports/alerts. ([Splunk Documentation][5])
9. **Reports** – saved searches with visualization and scheduling options. ([Splunk Lantern][6])
10. **Alerts** – saved searches configured with alerting conditions and actions. ([Splunk Lantern][6])
11. **Macros (search macros)** – reusable search fragments with optional arguments. ([Dante Cyber][2])
12. **Workflow actions** – actions (drilldowns, HTTP GET/POST, secondary searches) available from events in the UI. ([Dante Cyber][2])

**Modeling & higher-level structure**

13. **Data models** – hierarchical datasets (events/searches/transactions) used for CIM and Pivot. ([Dante Cyber][2])

---

## 2. Other objects that are often treated as “knowledge objects”

Some Splunk docs and community material also treat these as knowledge objects or very closely related: ([Kinney Group][7])

* **Dashboards** – collections of panels, reports, and visualizations.
* **Transactions** – grouped events that form a logical transaction (also used inside data models).
* **Source types** – definitions that tell Splunk how to parse and interpret incoming data.
* **Indexes** – logical buckets of stored data; some authors include them in the broader “knowledge object” umbrella.
* **Automatic lookups / lookup definitions / lookup table files** – specific subtypes of the general lookup concept.

---

If you want, next step I can:

* Trim this down to just the **types you care about for your dependency graph** (e.g., reports, alerts, macros, data models, lookups, dashboards, saved searches, event types, tags),
* And propose a **node-type taxonomy** for your Splunk KO visualizer (names, icons, and how they usually depend on each other).

[1]: https://www.splunk.com/en_us/pdfs/training/intro-to-knowledge-objects-course-description.pdf?utm_source=chatgpt.com "Introduction to Knowledge Objects"
[2]: https://dante-cyber.medium.com/splunk-enterprise-knowledge-objects-12f6212cc662?utm_source=chatgpt.com "Splunk Enterprise — Knowledge Objects | by Dante Mata"
[3]: https://docs.splunk.com/Documentation/Splunk/9.2.1/Knowledge/Abouteventtypes?utm_source=chatgpt.com "About event types | Splunk Docs"
[4]: https://splunk-infosec-documentation.readthedocs.io/en/latest/2%20-%20Concepts/?utm_source=chatgpt.com "Concepts - InfoSec App for Splunk Documentation"
[5]: https://docs.splunk.com/Splexicon%3AKnowledgeobject?utm_source=chatgpt.com "Splexicon:Knowledgeobject"
[6]: https://lantern.splunk.com/Splunk_Success_Framework/Improve_Performance_-_A_Prescriptive_Splunk_Outcome/Optimizing_systems_and_knowledge_objects/Cleaning_up_knowledge_objects?utm_source=chatgpt.com "Cleaning up knowledge objects"
[7]: https://kinneygroup.com/blog/know-your-knowledge-objects-in-splunk/?utm_source=chatgpt.com "Using Splunk Knowledge Objects"
