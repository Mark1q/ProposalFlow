interface ProposalInput {
    scopeId: string
}

interface ProposalResponse {
    finalMarkdown: string,
    pricingJson: JSON 
}
export { ProposalInput, ProposalResponse }