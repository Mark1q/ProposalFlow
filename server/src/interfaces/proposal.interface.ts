interface ProposalInput {
    scopeId: string,
    userId: string
}

interface ProposalResponse {
    finalMarkdown: string,
    pricingJson: JSON 
}
export { ProposalInput, ProposalResponse }