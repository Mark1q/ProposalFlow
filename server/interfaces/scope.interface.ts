interface ScopeInput {
  projectName: string,
  businessGoal: string,
  features: string[],
  techStack: string[],
  budget: number,
  timeline: string
}

interface ScopeId {
  id: string
}

export { ScopeInput, ScopeId }