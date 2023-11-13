const _ = require("lodash");

const contents = [
  {
    id: "string",
    name: "Project ID",
    description: "Please Specify the region",
    type: "textarea",
    required: false,
    private: false,
    text: "2694",
  },
  {
    id: "string",
    name: "Current Registry for Project",
    description: "Please put geographic identifier in format lat, lan",
    type: "textarea",
    required: true,
    private: false,
    text: "CDM Registry",
  },
  {
    id: "string",
    name: "Origin Project ID",
    description: "Please specify a project rating type",
    type: "textarea",
    required: true,
    private: false,
    text: "2694",
  },
  {
    id: "string",
    name: "Registry of Origin for Project",
    description: "Please specify project rating range (lowest)",
    type: "textarea",
    required: true,
    private: false,
    text: "CDM Registry",
  },
  {
    id: "string",
    name: "Project Program",
    description: "Please specify project rating range (highest)",
    type: "textarea",
    required: false,
    private: false,
    text: "string",
  },
  {
    id: "string",
    name: "Project Name",
    description: "Please specify project rating",
    type: "textarea",
    required: true,
    private: false,
    text: "Bhutan Windfarm",
  },
  {
    id: "string",
    name: "Project URL Link",
    description: "Please specify project rating link",
    type: "textarea",
    required: true,
    private: false,
    text: "https://cdm.unfccc.int/Registry/index.html",
  },
  {
    id: "string",
    name: "Project Developer",
    description: "Please specify any co-benefits (if any)",
    type: "textarea",
    required: false,
    private: false,
    text: "Wind Turbine Manufacturers LLC",
  },
  {
    id: "string",
    name: "Project Sector",
    description: "Please specify begin of crediting period",
    type: "datepicker",
    required: true,
    private: false,
    text: "Electricity; gas, steam and air conditioning supply",
  },
  {
    id: "string",
    name: "Project Type",
    description: "Please specify end of crediting period",
    type: "datepicker",
    required: true,
    private: false,
    text: "Energy Demand",
  },
  {
    id: "string",
    name: "Project Tags",
    description: "Please specify unit count of estimation",
    type: "textarea",
    required: false,
    private: false,
    text: "string",
  },
  {
    id: "string",
    name: "Project Covered by NDC",
    description: "Please specify Program related to this project",
    type: "textarea",
    required: true,
    private: false,
    text: "Inside NDC",
  },
  {
    id: "string",
    name: "Project NDC Information",
    description: "Please specify project link",
    type: "textarea",
    required: false,
    private: false,
    text: "string",
  },
  {
    id: "string",
    name: "Project Status",
    description: "Please list project tags (if any)",
    type: "textarea",
    required: false,
    private: false,
    text: "Completed",
  },
  {
    id: "string",
    name: "Project Status Date",
    description: "Please specify if this project is covered by NDC (yes/no)",
    type: "textarea",
    required: true,
    private: false,
    text: "12/31/2022",
  },
  {
    id: "string",
    name: "Project Unit Metric",
    description:
      "In case this project is covered by NDC, please add here related info",
    type: "textarea",
    required: false,
    private: false,
    text: "tC02e",
  },
  {
    id: "string",
    name: "Project Methodology",
    description: "Please specify unit metric for this project",
    type: "textarea",
    required: true,
    private: false,
    text: "CDM - AM0119",
  },
  {
    id: "string",
    name: "Project Validation Body",
    description: "Please specify project methodology",
    type: "textarea",
    required: true,
    private: false,
    text: "Carbon Check (India) Private Ltd.",
  },
  {
    id: "string",
    name: "Project Validation Date",
    description: "Please add info about validation body (if any)",
    type: "textarea",
    required: false,
    private: false,
    text: "11/15/2022",
  },
  {
    id: "string",
    name: "Co-benefit",
    description: "Please specify validation date (if any)",
    type: "datepicker",
    required: false,
    private: false,
    text: "SDG 5 - Gender equality|SDG 6 - Clean water and sanitation|SDG 7 - Affordable and clean energy",
  },
  {
    id: "string",
    name: "Estimation Crediting Period Start Date",
    description: "Please specify validation date (if any)",
    type: "datepicker",
    required: false,
    private: false,
    text: "1/1/2023|1/1/2021|1/1/2025",
  },
  {
    id: "string",
    name: "Estimation Crediting Period End Date",
    description: "Please specify validation date (if any)",
    type: "datepicker",
    required: false,
    private: false,
    text: "12/31/2023|12/31/2024|12/31/2025",
  },
  {
    id: "string",
    name: "Estimation Unit Count",
    description: "Please specify validation date (if any)",
    type: "datepicker",
    required: false,
    private: false,
    text: "125000|125000|175000",
  },
  {
    id: "string",
    name: "Label Name",
    description: "Please specify project rating link",
    type: "textarea",
    required: true,
    private: false,
    text: "CORSIA Eligibility|Cercarbono Certification",
  },
  {
    id: "string",
    name: "Label Type",
    description: "Please specify any co-benefits (if any)",
    type: "textarea",
    required: false,
    private: false,
    text: "Qualification|Certification",
  },
  {
    id: "string",
    name: "Label Crediting Period Start Date",
    description: "Please specify begin of crediting period",
    type: "datepicker",
    required: true,
    private: false,
    text: "1/1/2022|3/1/2022",
  },
  {
    id: "string",
    name: "Label Crediting Period End Date",
    description: "Please specify end of crediting period",
    type: "datepicker",
    required: true,
    private: false,
    text: "12/31/2025|12/31/2025",
  },
  {
    id: "string",
    name: "Label Validity Period Start Date",
    description: "Please specify begin of crediting period",
    type: "datepicker",
    required: true,
    private: false,
    text: "1/1/2023|3/1/2023",
  },
  {
    id: "string",
    name: "Label Validity Period End Date",
    description: "Please specify end of crediting period",
    type: "datepicker",
    required: true,
    private: false,
    text: "12/31/2030|12/31/2030",
  },
  {
    id: "string",
    name: "Label Unit Quantity",
    description: "Please Specify the region",
    type: "textarea",
    required: false,
    private: false,
    text: "500000|775000",
  },
  {
    id: "string",
    name: "Label URL Link",
    description: "Please put geographic identifier in format lat, lan",
    type: "textarea",
    required: true,
    private: false,
    text: "https://www.icao.int/environmental-protection/CORSIA/Documents/TAB/CORSIA%20Eligible%20Emissions%20Units_March2023.pdf|https://www.cercarbono.com/wp-content/uploads/2021/11/Cercarbonos-protocol-V3.1.pdf",
  },
  {
    id: "string",
    name: "Country Project Location",
    description: "Please specify a project rating type",
    type: "textarea",
    required: true,
    private: false,
    text: "Bhutan",
  },
  {
    id: "string",
    name: "Country Region Project Location",
    description: "Please specify project rating range (lowest)",
    type: "textarea",
    required: true,
    private: false,
    text: "Dagana",
  },
  {
    id: "string",
    name: "Project Geographic Identifier",
    description: "Please specify project rating range (highest)",
    type: "textarea",
    required: false,
    private: false,
    text: "27.5142° N, 90.4336° E",
  },
  {
    id: "string",
    name: "Project Rating Type",
    description: "Please specify project rating",
    type: "textarea",
    required: true,
    private: false,
    text: "CDP|CCQI",
  },
  {
    id: "string",
    name: "Project Highest Rating Possible",
    description: "Please specify project rating link",
    type: "textarea",
    required: true,
    private: false,
    text: "10|100",
  },
  {
    id: "string",
    name: "Project Lowest Rating Possible",
    description: "Please specify project rating",
    type: "textarea",
    required: true,
    private: false,
    text: "1|1",
  },
  {
    id: "string",
    name: "Project Rating",
    description: "Please specify project rating link",
    type: "textarea",
    required: true,
    private: false,
    text: "7|92",
  },
  {
    id: "string",
    name: "Project Rating URL Link",
    description: "Please specify project rating",
    type: "textarea",
    required: true,
    private: false,
    text: "https://www.cdp.net/en|https://carboncreditquality.org/",
  },
];

const map = {
  "Project ID": "projects.projectId",
  "Current Registry for Project": "projects.currentRegistry",
  "Origin Project ID": "projects.originProjectId",
  "Registry of Origin for Project": "projects.registryOfOrigin",
  "Project Program": "projects.program",
  "Project Name": "projects.projectName",
  "Project URL Link": "projects.projectLink",
  "Project Developer": "projects.projectDeveloper",
  "Project Sector": "projects.sector",
  "Project Type": "projects.projectType",
  "Project Tags": "projects.projectTags",
  "Project Covered by NDC": "projects.coveredByNDC",
  "Project NDC Information": "projects.ndcInformation",
  "Project Status": "projects.projectStatus",
  "Project Status Date": "projects.projectStatusDate",
  "Project Unit Metric": "projects.unitMetric",
  "Project Methodology": "projects.methodology",
  "Project Validation Body": "projects.validationBody",
  "Project Validation Date": "projects.validationDate",
  "Co-benefit": "projects.coBenefits[].cobenefit",
  "Estimation Crediting Period Start Date":
    "projects.estimations[].creditingPeriodStart",
  "Estimation Crediting Period End Date":
    "projects.estimations[].creditingPeriodEnd",
  "Estimation Unit Count": "projects.estimations[].unitCount",
  "Label Name": "projects.labels[].label",
  "Label Type": "projects.labels[].labelType",
  "Label Crediting Period Start Date":
    "projects.labels[].creditingPeriodStartDate",
  "Label Crediting Period End Date": "projects.labels[].creditingPeriodEndDate",
  "Label Validity Period Start Date":
    "projects.labels[].validityPeriodStartDate",
  "Label Validity Period End Date": "projects.labels[].validityPeriodEndDate",
  "Label Unit Quantity": "projects.labels[].unitQuantity",
  "Label URL Link": "projects.labels[].labelLink",
  "Country Project Location": "projects.projectLocations[].country",
  "Country Region Project Location":
    "projects.projectLocations[].inCountryRegion",
  "Project Geographic Identifier":
    "projects.projectLocations[].geographicIdentifier",
  "Project Rating Type": "projects.projectRatings[].ratingType",
  "Project Highest Rating Possible":
    "projects.projectRatings[].ratingRangeHighest",
  "Project Lowest Rating Possible":
    "projects.projectRatings[].ratingRangeLowest",
  "Project Rating": "projects.projectRatings[].rating",
  "Project Rating URL Link": "projects.projectRatings[].ratingLink",
  "Related Project ID": "projects.relatedProjects[].relatedProjectId",
  "Project Relationship Type": "projects.relatedProjects[].relationshipType",
  "Related Project Registry": "projects.relatedProjects[].registry",
  "Unit Project Location ID": "units.projectLocationId",
  "Unit Owner": "units.unitOwner",
  "Country Jurisdiction of Owner": "units.countryJurisdictionOfOwner",
  "Country Region Jurisdiction of Owner": "units.inCountryJurisdictionOfOwner",
  "Unit Vintage Year": "units.vintageYear",
  "Unit Type": "units.unitType",
  "Unit Marketplace": "units.marketplace",
  "Unit Markplace URL Link": "units.marketplaceLink",
  "Unit Marketplace Identifier": "units.marketplaceIdentifier",
  "Unit Tags": "units.unitTags",
  "Unit Status": "units.unitStatus",
  "Unit Status Reason": "units.unitStatusReason",
  "Unit Registry URL Link": "units.unitRegistryLink",
  "Unit Corresponding Adjustment Declaration":
    "units.correspondingAdjustmentDeclaration",
  "Unit Corresponding Adjustment Status": "units.correspondingAdjustmentStatus",
  "Unit Count": "units.unitCount",
  "Warehouse Project ID for Issuance": "units.issuance.warehouseProjectId",
  "Issuance Start Date": "units.issuance.startDate",
  "Issuance End Date": "units.issuance.endDate",
  "Issuance Verification Approach": "units.issuance.verificationApproach",
  "Issuance Verification Report Date": "units.issuance.verificationReportDate",
  "Issuance Verification Body": "units.issuance.verificationBody",
};

const object = {};
const normalizedContents = [];

contents.forEach((item) => {
  if (map[item.name].includes("[]")) {
    const value = item.text?.split("|");
    value.forEach((t, index) => {
      normalizedContents.push({
        ...item,
        index,
        text: value[index],
      });
    });
  } else {
    normalizedContents.push(item);
  }
});

normalizedContents
  .sort((a, b) => {
    // If both objects have an index, sort numerically
    if (a.hasOwnProperty("index") && b.hasOwnProperty("index")) {
      return a.index - b.index;
    }

    // If one of the objects does not have an index, sort it last
    if (!a.hasOwnProperty("index")) {
      return 1; // a should come after b
    }
    if (!b.hasOwnProperty("index")) {
      return -1; // b should come after a
    }
  })
  .forEach((item) => {
    let path = map[item.name];
    if (!_.isNil(item.index)) {
      path = map[item.name].replace("[]", `[${item.index}]`);
    }
    console.log(`path: ${path}`);
    _.set(object, path, item.text || item.date);
  });

console.log(JSON.stringify(object, null, 2));
