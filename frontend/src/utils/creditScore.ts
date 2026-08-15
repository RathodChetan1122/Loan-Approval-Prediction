export type CreditBand = {
    label: string;
    range: string;
    minimum: number;
    maximum: number;
    color: string;
};

export const bands: CreditBand[] = [
    {
        label: "POOR",
        range: "300–579",
        minimum: 300,
        maximum: 579,
        color: "#00c843",
    },
    {
        label: "FAIR",
        range: "580–669",
        minimum: 580,
        maximum: 669,
        color: "#92d120",
    },
    {
        label: "GOOD",
        range: "670–739",
        minimum: 670,
        maximum: 739,
        color: "#ffca32",
    },
    {
        label: "VERY GOOD",
        range: "740–799",
        minimum: 740,
        maximum: 799,
        color: "#ff7900",
    },
    {
        label: "EXCELLENT",
        range: "800–850",
        minimum: 800,
        maximum: 900,
        color: "#f20e18",
    },
];

export const getCreditBand = (score: number): CreditBand =>
    bands.find(
        (band) => score >= band.minimum && score <= band.maximum
    ) ?? bands[bands.length - 1];