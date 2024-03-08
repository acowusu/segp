import { Status } from "./mockData/data";
import { controlServiceEndpoint, delay, endpoints, getServiceStatus, launchService, shutdownService } from "./status";
import { test, expect, vi } from "vitest";

test("delay should resolve after the specified time", async () => {
    const startTime = Date.now();
    const delayTime = 500; // 1 second

    await delay(delayTime);

    const endTime = Date.now();
    const elapsedTime = endTime - startTime;

    expect(elapsedTime).toBeGreaterThanOrEqual(delayTime);
});

test("delay should resolve immediately when given 0 milliseconds", async () => {
    const startTime = Date.now();
    const delayTime = 0;

    await delay(delayTime);

    const endTime = Date.now();
    const elapsedTime = endTime - startTime;

    expect(elapsedTime).toBeLessThan(100); // Allow for a small margin of error
})



test("launchService should launch the specified service", async () => {
    const serviceName = "Image API";
    const expectedBody = {
        serviceName,
        command: "launch"
    };

    const mockResponse = {
        status: 200,
        text: vi.fn().mockResolvedValue("Service launched successfully")
    };
    const mockFetch = vi.fn().mockResolvedValue(mockResponse);
    global.fetch = mockFetch;

    await launchService(serviceName);

    expect(mockFetch).toHaveBeenCalledWith(controlServiceEndpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(expectedBody)
    });
    expect(mockResponse.text).toHaveBeenCalled();
});

test("launchService should throw an error if the service is not found", async () => {
    const serviceName = "nonExistentService";

    expect(async () => {
        await launchService(serviceName);
    }).rejects.toThrow("Service not found");
});

test("launchService should throw an error if failed to launch the service", async () => {
    const serviceName = "Image API";
    const mockResponse = {
        status: 500,
        text: vi.fn().mockResolvedValue("Failed to launch service")
    };
    const mockFetch = vi.fn().mockResolvedValue(mockResponse);
    global.fetch = mockFetch;

    expect(async () => {
        await launchService(serviceName);
    }).rejects.toThrow("Failed to Launch service");
});


test("shutdownService should shutdown the specified service", async () => {
    const serviceName = "Image API";
    const expectedBody = {
        serviceName,
        command: "shutdown"
    };

    const mockResponse = {
        status: 200,
        text: vi.fn().mockResolvedValue("Service shutdown successfully")
    };
    const mockFetch = vi.fn().mockResolvedValue(mockResponse);
    global.fetch = mockFetch;

    await shutdownService(serviceName);

    expect(mockFetch).toHaveBeenCalledWith(controlServiceEndpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(expectedBody)
    });
});

test("shutdownService should throw an error if the service is not found", async () => {
    const serviceName = "nonExistentService";

    expect(async () => {
        await shutdownService(serviceName);
    }).rejects.toThrow("Service not found");
});

test("shutdownService should throw an error if failed to shutdown the service", async () => {
    const serviceName = "Image API";
    const mockResponse = {
        status: 500,
        text: vi.fn().mockResolvedValue("Failed to shutdown service")
    };
    const mockFetch = vi.fn().mockResolvedValue(mockResponse);
    global.fetch = mockFetch;

    expect(async () => {
        await shutdownService(serviceName);
    }).rejects.toThrow("Failed to shutdown service");
});
test("getServiceStatus should return an array of status objects", async () => {
    // Arrange
    const statuses = ['Unresponsive', 'Unresponsive', 'Unresponsive', 'Unresponsive', 'Unresponsive', 'Unresponsive', 'Unresponsive']
    const expectedStatuses: Status[] = endpoints.map((endpoint, i) => ({
        url: endpoint.url,
        name: endpoint.name,
        status: statuses[i]
    }));

    // Mock the fetch function
    const mockFetch = vi.fn().mockResolvedValueOnce({
        status: 200
    }).mockResolvedValueOnce({
        status: 500
    }).mockRejectedValueOnce(new Error("AbortError")).mockResolvedValueOnce({
        status: 200
    }).mockResolvedValueOnce({
        status: 500
    }).mockRejectedValueOnce(new Error("AbortError"));

    global.fetch = mockFetch;

    // Act
    const result = await getServiceStatus();

    // Assert
    expect(result).toEqual(expectedStatuses);
    expect(mockFetch).toHaveBeenCalledTimes(7);
});


test("getServiceStatus should handle request abort error", async () => {
    // Arrange
   
    const expectedStatuses: Status[] = endpoints.map(endpoint => ({
        url: endpoint.url,
        name: endpoint.name,
        status: "Unresponsive"
    }));

    // Mock the fetch function to throw an AbortError
    const mockFetch = vi.fn().mockRejectedValue(new Error("AbortError"));
    global.fetch = mockFetch;

    // Act
    const result = await getServiceStatus();

    // Assert
    expect(result).toEqual(expectedStatuses);
    expect(mockFetch).toHaveBeenCalledTimes(7);
});

test("getServiceStatus should handle other errors", async () => {
    // Arrange
    const expectedStatuses: Status[] = endpoints.map(endpoint => ({
        url: endpoint.url,
        name: endpoint.name,
        status: "Unresponsive"
    }));

    // Mock the fetch function to throw an error
    const mockFetch = vi.fn().mockRejectedValue(new Error("Some error"));
    global.fetch = mockFetch;

    // Act
    const result = await getServiceStatus();

    // Assert
    expect(result).toEqual(expectedStatuses);
    expect(mockFetch).toHaveBeenCalledTimes(7);
});