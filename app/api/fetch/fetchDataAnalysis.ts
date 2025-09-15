/**
 * Fetch analysis data based on the selected analysis type and panel ID.
 * @param selectedAnalysis The type of analysis to fetch.
 * @param panelId The ID of the panel for which to fetch the analysis data.
 * @returns The fetched analysis data.
 */

export async function fetchAnalysisData(selectedAnalysis: string, panelId: string) {
  const response = await fetch(`http://localhost:9090/${selectedAnalysis}?panel_id=${panelId}`, {
      method: "GET",
      credentials: "include",
    });
    const data = await response.json();
    return data;
  }