import { Status } from "./mockData/data";

const endpoints = [
    {
        url: "https://iguana.alexo.uk/v0/status",
        name: "Text to speech API",
    },
    // {
    //     url: "https://iguana.alexo.uk/v1/status",
    //     name: "V1 API",
    // },
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
        name: "Avatar API",
    },
    // {
    //     url: "https://iguana.alexo.uk/v5/status",
    //     name: "V5 API",
    // },
    {
        url: "https://iguana.alexo.uk/v6/status",
        name: "Music API",
    },
    {
        url: "https://iguana.alexo.uk/v7/status",
        name: "Sound Effects API",
    }
]
export const delay = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
};
const statusServiceEndpoint = (serviceName: string) => "https://iguana.alexo.uk/v8/status/" + serviceName
interface ServiceStatusResponse {
    status: string;
    isInactive: boolean;
    isRunning: boolean;
    memoryUsage: string;
    uptime: string;
    lastCalled: string;
    LastStatusCode: string;
    last_line: string;
    isCudaError: boolean;
}
export const getServiceStatus = async (): Promise<Status[]> => {
    const statuses: Status[] = []
    for (const endpoint of endpoints) {
        // console.log("Checking", endpoint.url)
        const controller = new AbortController();
        const { signal } = controller;



        try {
            const statusServiceResponse = await fetch(statusServiceEndpoint(endpoint.name));
            const statusService = await statusServiceResponse.json() as ServiceStatusResponse
            if (statusService.isCudaError) {
                console.log("Cuda error RESTART THE SERVICE:", endpoint.name)
                statuses.push({ url: endpoint.url, name: endpoint.name, status: "Offline" });
                console.log("Shutting down service ", endpoint.name)
                shutdownService(endpoint.name)
                continue
            }

            const response = await Promise.race([fetch(endpoint.url, { signal }), delay(1000).then(() => { controller.abort(); throw new Error("AbortError") })]);
            statuses.push({ url: endpoint.url, name: endpoint.name, status: response.status === 200 ? "Online" : "Offline" });
            // Handle the response
        } catch (error) {
            if ((error as Error).name === 'AbortError') {
                // console.log('Request aborted');
                statuses.push({ url: endpoint.url, name: endpoint.name, status: "Unresponsive" });

            } else {
                // console.error('Error:', error);
                statuses.push({ url: endpoint.url, name: endpoint.name, status: "Unresponsive" });

            }
        }
    }
    return statuses
}

const controlServiceEndpoint = "https://iguana.alexo.uk/v8/control"
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
        throw new Error("Failed to Launch service");
    }
    const text = await response.text()
    console.log("Service launched", text)
}