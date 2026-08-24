# Resource Analytics Frontend

This Next.js application is the web interface for the Resource Analytics tool. It works with [`chrispader/resource-analytics_backend`](https://github.com/chrispader/resource-analytics_backend) and builds on [`maxscho/resource-analytics_frontend`](https://github.com/maxscho/resource-analytics_frontend).

## Resource × Role Matrix

The thesis extension makes the Resource × Role Matrix available from the analysis menu. Users can inspect the Plotly matrix, hover over assignments, and switch between the available orderings.

The matrix interface was developed on `feat/visualization-resource-role-matrix` and merged through [pull request #2](https://github.com/chrispader/resource-analytics_frontend/pull/2). The evaluation interface is kept in the separate `feat/evaluation-suite` branch and stacked on the current `@chrispader/feat/new-visualizations` branch.

## Local setup

Start the backend on port `9090`. Then install the frontend dependencies and run the development server:

```bash
ni
nr dev
```

Open `http://localhost:3000`. The current frontend sends its API requests to `http://localhost:9090`.

## Main files

- `app/page.tsx` contains the main application layout and event-log upload flow.
- `components/AnalysisDropdown.tsx` lists the available analyses.
- `components/AnalysisPanel.tsx` loads and displays the selected analysis.
- `models/AnalysisData.ts` defines the data received from the backend.
- `styles/components/` contains the component styles.

## Branches used for the thesis

| Branch | Purpose |
| --- | --- |
| `@chrispader/feat/new-visualizations` | Shared base containing the merged visualization work. |
| `feat/visualization-resource-role-matrix` | Matrix selection and display; merged into the base branch. |
| `feat/evaluation-suite` | Evaluation tables, comparison view, heuristic findings, and CSV export. |

Older evaluation branches were consolidated into `feat/evaluation-suite`. They are kept only as historical references and should not be used for new work.
