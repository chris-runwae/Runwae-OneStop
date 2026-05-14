import { api } from "@runwae/convex/convex/_generated/api";
import { useAction, useMutation, useQuery } from "convex/react";

export function useGenerateFreeFormTrip() {
  return useAction(api.ai.generateFreeFormTrip);
}

export function useAiQuota() {
  return useQuery(api.ai.getQuota, {});
}

export function useMyAiTrips() {
  return useQuery(api.ai.getMyAiTrips, {});
}

export function useGenerateTripFromUrl() {
  return useAction(api.media.generateTripFromUrl);
}

export function useMyActiveImports() {
  return useQuery(api.media.myActiveImports, {});
}

export function useDismissImport() {
  return useMutation(api.media.dismissImport);
}
