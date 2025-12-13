import { JsonValue } from "@prisma/client/runtime/client";
import { ProposalResponse } from "../interfaces/proposal.interface";
import { PYTHON_SERVICE_URL } from "../lib/env.variables";

export const generateProposalDetails = async (scopeJson: JsonValue): Promise<ProposalResponse> => {
    const response = await fetch(PYTHON_SERVICE_URL || 'http://localhost:8000/generate', {
        method: "POST",
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify(scopeJson)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch proposal details: ${errorText}`);
    }

    const data: ProposalResponse = await response.json();
    return data;
}