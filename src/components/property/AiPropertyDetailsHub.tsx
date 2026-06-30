import React from 'react';
import { AiLocationIntelligence } from './AiLocationIntelligence';
import { AiPropertyCopilot } from './AiPropertyCopilot';
import { AiPropertyInsights } from './AiPropertyInsights';
import { AiPropertyIntelligenceReport } from './AiPropertyIntelligenceReport';

type Props = {
  listingId: number;
  propertyTitle: string;
  /** Matches web's `showSeekerTools && planEnabled` — seeker role, not their own listing,
   *  and an active Essential plan. The chat backend 403s anyone else, so hide it for them. */
  showCopilot: boolean;
  onCopilotComposerFocus?: () => void;
};

/**
 * ThaneFlats AI hub on property details — mirrors web sections:
 * Location Intelligence, Intelligence Report, AI Assistant, Property Copilot.
 */
export function AiPropertyDetailsHub({
  listingId,
  propertyTitle,
  showCopilot,
  onCopilotComposerFocus,
}: Props) {
  return (
    <>
      <AiLocationIntelligence listingId={listingId} />
      <AiPropertyIntelligenceReport listingId={listingId} />
      <AiPropertyInsights listingId={listingId} />
      {showCopilot ? (
        <AiPropertyCopilot
          listingId={listingId}
          propertyTitle={propertyTitle}
          onComposerFocus={onCopilotComposerFocus}
        />
      ) : null}
    </>
  );
}
