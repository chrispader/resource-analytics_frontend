/**
 * Creates an onboarding tutorial using the Joyride library.
 */

import React, { useEffect, useState } from "react";
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";

interface OnboardingTutorialProps {
  runOnboardingTutorial: boolean;
  setRunOnboardingTutorial: (runOnboardingTutorial: boolean) => void;
  eventlogUploaded: boolean;
  analysisSelected: boolean;
  analysisPanelControl: boolean;
}

const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({
  runOnboardingTutorial,
  setRunOnboardingTutorial,
  eventlogUploaded,
  analysisSelected,
  analysisPanelControl,
}) => {
  const [steps, setSteps] = useState<Step[]>([]);

  /**
   * Dynamically generate the steps for the onboarding tutorial based on the current state of the application.
   * The steps are adjusted according to whether an event log has been uploaded, whether an analysis has been selected,
   * and whether the analysis panel control is active.
   */
  useEffect(() => {
    const dynamicSteps: Step[] = [];

    if (!eventlogUploaded) {
      dynamicSteps.push({
        target: "#uploadEventLogButton",
        content:
          "This button lets you upload a new event log for your analysis. (csv is the supported format)",
      });
    }

    if (eventlogUploaded) {
      dynamicSteps.push({
        target: "#interactiveGraph",
        content: "This is the interactive graph of the event log. You can either hover an element to view further information in a tooltip or click on it to view some more analysis details.",
      });

      dynamicSteps.push({
        target: "#analysisSelectionPanel",
        content:
          "This dropdown lets you select the choosen analysis type. With the info-button you can get more information about the analysis.",
      });

      dynamicSteps.push({
        target: ".processOverviewButton",
        content:
          "This button lets you hide or show the process overview to gain more space for the analysis panels.",
      });
    }

    if (eventlogUploaded && analysisSelected) {

      dynamicSteps.push({
        target: "#analysisTable",
        content: "This table shows the analysis results. You can click on a row in the table to select it and view the corresponding data in the plot.",
      });

      dynamicSteps.push({
        target: ".addAnalysisButton",
        content:
          "This button lets you add a new analysis panel. All analysis panels are independent from one another.",
      });
    }

    if (eventlogUploaded && analysisSelected) {
      dynamicSteps.push({
        target: "#analysisFilterPanel",
        content:
          "This panel lets you filter the analysis, by filter the event log dataset. Therefore, both the analysis table and the plots are affected by this filter.",
      });
    }

    if (eventlogUploaded && analysisSelected && analysisPanelControl) {
      dynamicSteps.push({
        target: "#tableControlsPanel",
        content:
          "This panel lets you control the analysis table. You can show/hide columns from the table, set filter for each column and reset the selected row.",
      });
    }

    if (eventlogUploaded && analysisSelected && analysisPanelControl) {
      dynamicSteps.push({
        target: "#resetSelectedRowButton",
        content:
          "This button lets you reset the selection from the table or from the plot.",
      });
    }

    // Step 8 – eventlogUploaded && analysisSelected && !analysisPanelControl
    if (eventlogUploaded && analysisSelected && !analysisPanelControl) {
      dynamicSteps.push({
        target: "#searchTableString",
        content:
          "This text input lets you search across the whole table. Both numbers and strings are supported.",
      });
    }

    setSteps(dynamicSteps);
  }, [
    runOnboardingTutorial,
    eventlogUploaded,
    analysisSelected,
    analysisPanelControl,
  ]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRunOnboardingTutorial(false);
      return;
    }
  };

  return (
    <Joyride
      steps={steps}
      run={runOnboardingTutorial}
      continuous
      showProgress
      showSkipButton
      scrollToFirstStep
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: "#0f172a",
          zIndex: 10000,
        },
      }}
    />
  );
};

export default OnboardingTutorial;
