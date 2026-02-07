interface ProposalInput {
    scopeId: string,
    userId: string
}

interface ProposalId {
    id: string
}

interface ProposalResponse {
    finalMarkdown: string,
    pricingJson: JSON 
}
export { ProposalInput, ProposalId, ProposalResponse }