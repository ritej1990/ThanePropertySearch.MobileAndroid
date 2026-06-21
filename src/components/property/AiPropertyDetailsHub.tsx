import React from 'react';
import { AiLocationIntelligence } from './AiLocationIntelligence';
import { AiPropertyCopilot } from './AiPropertyCopilot';
import { AiPropertyInsights } from './AiPropertyInsights';
import { AiPropertyIntelligenceReport } from './AiPropertyIntelligenceReport';

type Props = {
  listingId: number;
  propertyTitle: string;
};

/**
 * ThaneFlats AI hub on property details — mirrors web sections:
 * Location Intelligence, Intelligence Report, AI Assistant, Property Copilot.
 */
export function AiPropertyDetailsHub({ listingId, propertyTitle }: Props) {
  return (
    <>
      <AiLocationIntelligence listingId={listingId} />
      <AiPropertyIntelligenceReport listingId={listingId} />
      <AiPropertyInsights listingId={listingId} />
      <AiPropertyCopilot listingId={listingId} propertyTitle={propertyTitle} />
    </>
  );
}
