// Define the map
import {RecommendationsComponent} from "./recommendations/recommendations.component";
import {BriefResultComponent} from "./brief-result/brief-result/brief-result.component";
import {CustomOnlineAvailabilityComponent} from "./custom-online-availability/custom-online-availability.component";
import {CustomFormControlComponent} from "./customFormControl/custom-form-control/custom-form-control.component";

export const selectorComponentMap = new Map<string, any>([
  ['nde-search-bar-presenter-after', RecommendationsComponent],
  ['nde-search-result-item-container-before', BriefResultComponent],
  ['nde-online-availability-bottom', CustomOnlineAvailabilityComponent],
  ['nde-base-request-form-after', CustomFormControlComponent]
]);
