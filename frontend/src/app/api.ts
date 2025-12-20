import { JSONValue } from "next/dist/server/config-shared";

export async function callApi(proposalId: string): Promise<JSONValue> {
    const baseUrl = process.env.NEXT_PUBLIC_EXPRESS_API_SERVICE || 'http://localhost:3000/api/proposal';

    const url = `${baseUrl.replace(/\/$/, '')}/${proposalId}`;

    console.log(url);

    const response: Response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })

    if(!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch proposal details: ${errorText}`);
    }

    return await response.json();
}