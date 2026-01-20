"use client";

import React, { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Step, CallBackProps } from '@list-labs/react-joyride';
import { usePathname } from 'next/navigation';
import { useOnboardingTour } from './OnboardingTourContext';

const Joyride = dynamic(() => import('@list-labs/react-joyride'), { ssr: false });

const OnboardingTour: React.FC = () => {
  const { run, startTour, stopTour } = useOnboardingTour();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    // Only run the tour if it hasn't run before and the user is on an 'onboardable' page
    const tourHasRun = localStorage.getItem('onboardingTourHasRun');
    const onboardablePaths = ['/dashboard', '/statistics', '/profile']; // Base paths for onboarding

    const isOnboardablePage = onboardablePaths.some(path => pathname.startsWith(path));

    if (!tourHasRun && isOnboardablePage) {
      setTimeout(() => {
        startTour();
      }, 500);
    }
  }, [pathname, startTour, isClient]);

  const steps = useMemo(() => {
    let allSteps: Step[] = [];
    const commonSteps: Step[] = [];

    let pageSpecificSteps: Step[] = [];

    if (pathname.includes('/dashboard/')) {
        pageSpecificSteps = [
            {
                target: '#tour-back-button',
                content: 'Go back to the previous page.',
                placement: 'bottom',
                disableBeacon: true,
            },
            {
                target: '#tour-reject-button',
                content: 'Reject this case.',
                placement: 'bottom',
                disableBeacon: true,
            },
            {
                target: '#tour-validate-button',
                content: 'Validate this case.',
                placement: 'bottom',
                disableBeacon: true,
            },
            {
                target: '#patient-identity-card',
                content: 'This card displays the patient\'s identity information.',
                placement: 'right',
                disableBeacon: true,
            },
            {
                target: '#vitals-card',
                content: 'Here you can see the patient\'s vital parameters.',
                placement: 'left',
                disableBeacon: true,
            },
            {
                target: '#tour-admin-section',
                content: 'This section contains the administrative information of the patient.',
                placement: 'right',
                disableBeacon: true,
            },
            {
                target: '#tour-civil-status',
                content: 'The patient\'s civil status.',
                placement: 'bottom',
                disableBeacon: true,
            },
            {
                target: '#tour-condition',
                content: 'The patient\'s condition.',
                placement: 'bottom',
                disableBeacon: true,
            },
            {
                target: '#tour-medical-service',
                content: 'The medical service where the patient is being treated.',
                placement: 'bottom',
                disableBeacon: true,
            },
            {
                target: '#tour-consultation-section',
                content: 'This section contains the consultation details.',
                placement: 'left',
                disableBeacon: true,
            },
            {
                target: '#tour-consultation-reason',
                content: 'The reason for the consultation.',
                placement: 'bottom',
                disableBeacon: true,
            },
            {
                target: '#tour-consultation-notes',
                content: 'The notes taken during the consultation.',
                placement: 'bottom',
                disableBeacon: true,
            },
            {
                target: '#tour-ai-analysis-section',
                content: 'This section contains the analysis made by the AI.',
                placement: 'right',
                disableBeacon: true,
            },
            {
                target: '#tour-ai-symptoms',
                content: 'The symptoms identified by the AI.',
                placement: 'bottom',
                disableBeacon: true,
            },
            {
                target: '#tour-ai-suspected-diseases',
                content: 'The diseases suspected by the AI.',
                placement: 'bottom',
                disableBeacon: true,
            },
            {
                target: '#tour-history-section',
                content: 'This section contains the patient\'s medical history.',
                placement: 'top',
                disableBeacon: true,
            },
            {
                target: '#tour-history-allergies',
                content: 'The patient\'s allergies.',
                placement: 'bottom',
                disableBeacon: true,
            },
            {
                target: '#tour-history-chronic',
                content: 'The patient\'s chronic diseases.',
                placement: 'bottom',
                disableBeacon: true,
            },
            {
                target: '#tour-history-other',
                content: 'Other relevant medical history of the patient.',
                placement: 'bottom',
                disableBeacon: true,
            },
            {
                target: '#tour-exams-section',
                content: 'This section contains the results of the exams.',
                placement: 'left',
                disableBeacon: true,
            },
            {
                target: '#tour-physical-diagnosis',
                content: 'The physical diagnosis.',
                placement: 'bottom',
                disableBeacon: true,
            },
            {
                target: '#tour-complementary-exams',
                content: 'The results of the complementary exams.',
                placement: 'bottom',
                disableBeacon: true,
            },
            {
                target: '#tour-treatment-section',
                content: 'This section contains the prescribed treatment.',
                placement: 'right',
                disableBeacon: true,
            },
            {
                target: '#tour-prescribed-treatments',
                content: 'The prescribed treatments.',
                placement: 'bottom',
                disableBeacon: true,
            },
            {
                target: '#tour-final-diagnosis',
                content: 'The final diagnosis.',
                placement: 'top',
                disableBeacon: true,
            },
        ]
    } else if (pathname.startsWith('/dashboard')) {
      pageSpecificSteps = [
        {
            target: '#main-navbar',
            content: 'This is the main navigation bar. You can access different sections of the application from here.',
            placement: 'bottom',
            disableBeacon: true,
        },
        {
            target: '#tour-logo-link',
            content: 'Click here to go back to the main page.',
            placement: 'bottom',
            disableBeacon: true,
        },
        {
            target: '#tour-dashboard-link',
            content: 'Access the dashboard to see the clinical cases.',
            placement: 'bottom',
            disableBeacon: true,
        },
        {
            target: '#tour-statistics-link',
            content: 'View statistics about the clinical cases.',
            placement: 'bottom',
            disableBeacon: true,
        },
        {
            target: '#tour-start-button',
            content: 'You can restart this tour anytime by clicking here.',
            placement: 'bottom',
            disableBeacon: true,
        },
        {
            target: '#tour-language-switcher-button',
            content: 'Change the display language of the application.',
            placement: 'bottom',
            disableBeacon: true,
        },
        {
            target: '#tour-profile-dropdown-button',
            content: 'Access your profile and logout from here.',
            placement: 'bottom',
            disableBeacon: true,
        },
        {
          target: '#patient-identity-card',
          content: 'This card displays the patient\'s identity information.',
          placement: 'right',
          disableBeacon: true,
        },
        {
          target: '#vitals-card',
          content: 'Here you can see the patient\'s vital parameters.',
          placement: 'left',
          disableBeacon: true,
        },
      ];
    } else if (pathname.startsWith('/statistics')) {
      pageSpecificSteps = [
        {
          target: '#stats-card',
          content: 'This section provides an overview of key statistics.',
          placement: 'bottom',
          disableBeacon: true,
        },
        {
          target: '#demographics-chart',
          content: 'Explore demographic data related to the clinical cases.',
          placement: 'top',
          disableBeacon: true,
        },
        {
          target: '#top-pathologist-list',
          content: 'See the top performing pathologists.',
          placement: 'left',
          disableBeacon: true,
        },
      ];
    } else if (pathname.startsWith('/profile')) {
      pageSpecificSteps = [
        {
          target: '#tour-home-breadcrumb',
          content: 'Go back to the home page.',
          disableBeacon: true,
        },
        {
          target: '#profile-personal-info',
          content: 'This section is for your personal information.',
          disableBeacon: true,
        },
        {
            target: '#tour-change-photo-button',
            content: 'Change your profile picture.',
            disableBeacon: true,
        },
        {
            target: '#tour-remove-photo-button',
            content: 'Remove your profile picture.',
            disableBeacon: true,
        },
        {
            target: '#tour-personal-save-button',
            content: 'Save your personal information.',
            disableBeacon: true,
        },
        {
            target: '#tour-personal-cancel-button',
            content: 'Cancel the changes.',
            disableBeacon: true,
        },
        {
          target: '#profile-professional-info',
          content: 'This section is for your professional information.',
          disableBeacon: true,
        },
        {
            target: '#tour-professional-save-button',
            content: 'Save your professional information.',
            disableBeacon: true,
        },
        {
            target: '#tour-professional-cancel-button',
            content: 'Cancel the changes.',
            disableBeacon: true,
        },
        {
          target: '#profile-change-password',
          content: 'You can change your password here.',
          disableBeacon: true,
        },
        {
            target: '#tour-password-save-button',
            content: 'Save your new password.',
            disableBeacon: true,
        },
        {
            target: '#tour-password-cancel-button',
            content: 'Cancel the password change.',
            disableBeacon: true,
        },
      ];
    }

    allSteps = [...commonSteps, ...pageSpecificSteps];

    if (allSteps.length > 0) {
        allSteps[allSteps.length - 1].locale = { last: 'End Tour' };
    }

    return allSteps;
  }, [pathname]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type } = data;
    if (['finished', 'skipped'].includes(status)) {
      stopTour();
      localStorage.setItem('onboardingTourHasRun', 'true');
    }
  };

  if (!isClient) {
    return null;
  }
  
  return (
    <Joyride
      run={run}
      steps={steps}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      debug={true}
      disableScrolling={true}
      spotlightClicks={true}
      floaterProps={{
        offset: 0,
      }}
      styles={{
        options: {
          zIndex: 10000,
        },
      }}
    />
  );
};

export default OnboardingTour;
