import { Status } from "./mockData/data";

const endpoints = [
    {
        url: "https://iguana.alexo.uk/v0/status",
        name: "Text to speech API",
    },
    {
        url: "https://iguana.alexo.uk/v1/status",
        name: "V1 API",
    },
    {
        url: "https://iguana.alexo.uk/v2/status",
        name: "Image API",
    },
    {
        url: "https://iguana.alexo.uk/v3/status",
        name: "LLM API",
    },
    {
        url: "https://iguana.alexo.uk/v4/status",
        name: "V4 API",
    },
    {
        url: "https://iguana.alexo.uk/v5/status",
        name: "V5 API",
    },
    {
        url: "https://iguana.alexo.uk/v6/status",
        name: "Music API",
    },
    {
        url: "https://iguana.alexo.uk/v7/status",
        name: "Sound Effects API",
    }
]

const controlServiceEndpoint = "https://iguana.alexo.uk/v5/control"
export const getServiceStatus = async (): Promise<Status[]> => {
    const statuses: Status[] = []
    for (const endpoint of endpoints) {
        const response = await fetch(endpoint.url);
        statuses.push({ url: endpoint.url, name: endpoint.name, status: response.status === 200 ? "Online" : "Offline" });
    }
    return statuses
}

export const shutdownService = async (serviceName: string): Promise<void> => {
    const endpoint = endpoints.find(e => e.name === serviceName);
    if (endpoint === undefined) {
        throw new Error("Service not found");
    }
    const body = {
        serviceName,
        command: "shutdown"
    };

    const response = await fetch(controlServiceEndpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });
    if (response.status !== 200) {
        throw new Error("Failed to shutdown service");
    }
}
export const launchService = async (serviceName: string): Promise<void> => {
    const endpoint = endpoints.find(e => e.name === serviceName);
    if (endpoint === undefined) {
        throw new Error("Service not found");
    }
    const body = {
        serviceName,
        command: "launch"
    };

    const response = await fetch(controlServiceEndpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });
    if (response.status !== 200) {
        throw new Error("Failed to shutdown service");
    }
    const text = await response.text()
    console.log("Service launched", text)
}