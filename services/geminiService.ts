import { GoogleGenAI } from "@google/genai";
import { Finding, Target } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API_KEY is not defined");
  return new GoogleGenAI({ apiKey });
};

export const generateRiskReport = async (
  target: Target, 
  findings: Finding[], 
  type: 'EXECUTIVE' | 'TECHNICAL' | 'COMPLIANCE' = 'EXECUTIVE'
) => {
  try {
    const ai = getClient();
    
    let instructions = "";
    switch(type) {
      case 'EXECUTIVE':
        instructions = "Focus on business risk, financial impact, and strategic roadmap. Use non-technical language where possible. Highlight immediate threats to reputation and data.";
        break;
      case 'TECHNICAL':
        instructions = "Focus on reproduction steps, specific CVEs, CVSS vectors, and code-level remediation. Include command-line examples for verification.";
        break;
      case 'COMPLIANCE':
        instructions = "Map findings to ISO 27001, SOC2, and GDPR controls. Highlight compliance violations and necessary policy updates.";
        break;
    }

    const prompt = `
      Act as a Senior Principal Security Architect and Technical Writer.
      
      Target: ${target.domain}
      Risk Score: ${target.riskScore}/100
      Report Type: ${type}
      
      Findings Data (JSON):
      ${JSON.stringify(findings.slice(0, 20))}
      
      Generate a professional ${type.toLowerCase()} security report.
      
      ${instructions}
      
      Structure:
      1. Title & Date
      2. Summary
      3. Critical Findings (if any)
      4. Remediation Plan
      5. ${type === 'EXECUTIVE' ? 'Budget & Timeline' : 'Verification Steps'}
      
      Format as clean Markdown.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("AI Generation Error:", error);
    return "Unable to generate report. Please check API Key configuration.";
  }
};

export const analyzeFinding = async (finding: Finding) => {
  try {
    const ai = getClient();
    const prompt = `
      Analyze this specific vulnerability finding:
      Tool: ${finding.tool}
      Title: ${finding.title}
      Description: ${finding.description}
      
      Provide:
      1. A technical explanation of why this is dangerous.
      2. A specific 'gcloud' or 'bash' command to verify it manually (if applicable) or a curl command.
      3. A concise remediation step for a DevOps engineer.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return "Analysis failed.";
  }
};

export const analyzeToolOutput = async (rawOutput: string, toolName: string) => {
  try {
    const ai = getClient();
    const prompt = `
      Act as a Senior Lead Security Engineer and DevSecOps Architect.
      Analyze the following raw output from the security tool "${toolName}".
      
      Raw Output:
      ${rawOutput}
      
      Provide a detailed analysis in Markdown format:
      
      ### 1. Classification
      - **Vulnerability Category**: Determine the specific category (e.g., SQL Injection, XSS, Misconfiguration, Sensitive Data Exposure, Vulnerable Component).
      - **Severity Assessment**: Critical/High/Medium/Low with justification.

      ### 2. Executive Summary
      Concise summary of what was found.

      ### 3. Risk Assessment
      - **Impact**: Potential consequences.
      - **Likelihood**: Probability of exploitation.
      - **False Positive Confidence**: (Low/Medium/High) with reasoning.

      ### 4. Technical Deep Dive
      Explain the vulnerability or finding in technical depth. Why is this specific output concerning?

      ### 5. Mitigation & Remediation (Step-by-Step)
      Provide detailed, copy-pasteable instructions for remediation.
      - **Configuration Changes**: Show the specific config lines (e.g., Nginx, Apache, AWS Security Groups).
      - **Commands**: Provide bash/CLI commands to fix or verify the fix.
      - **Code Patches**: If applicable, show code snippets (e.g., Python, Go, Node.js) to sanitize input or fix logic.

      ### 6. Validation
      How to verify the fix using ${toolName} or other standard tools (curl, etc).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return "Analysis failed.";
  }
};