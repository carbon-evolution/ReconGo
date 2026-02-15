# ReconGo: Distributed Reconnaissance Engine

![ReconGo Architecture](assets/screenshot.png)

## Overview
**ReconGo (RedOps)** is a high-performance, distributed reconnaissance framework designed for professional security researchers and red team operations. I architected this system as a **concurrent, event-driven engine** using **Go pipelines** to handle large-scale data ingestion and analysis with minimal latency.

## Architectural Highlights

### 1. Concurrent Go Pipelines
The core engine is built on a non-blocking pipeline architecture. Each reconnaissance phase (discovery, probing, fuzzing) operates as a separate stage, connected by buffered channels. This allows for horizontal scaling and prevents bottlenecking during intensive scans.

### 2. Production-Grade Safety & Performance
- **Context-Driven Lifecycle**: I implemented `context.Context` throughout the service layer to ensure graceful shutdowns and prevent resource leaks during aborted operations.
- **Resource Management**: Global semaphores are utilized to manage concurrent tool execution, preventing system exhaustion and ensuring deterministic performance under high load.
- **Stateless Execution**: The engine is designed to be stateless, allowing for easy containerization and deployment across distributed clusters.

## Extensibility: Writing a Plugin

ReconGo is designed for developers. You can extend the engine's capabilities by implementing the `Scanner` interface.

### Step-by-Step Plugin Creation
1. **Define the Interface**: Create a new Go struct that implements the `Scan(target string)` method.
2. **Register the Plugin**: Add your scanner to the `plugins/registry.go` file.
3. **Handle Concurrency**: Ensure your plugin respects the provided `context.Context` for cancellation and timeouts.

```go
type CustomScanner struct {
    timeout time.Duration
}

func (s *CustomScanner) Scan(ctx context.Context, target string) ([]Result, error) {
    // Implement your logic here
    // Respect ctx.Done() for graceful termination
    return results, nil
}
```

## Technology Stack
- **Backend Architecture**: Go (Golang) with Pipeline Design Pattern
- **Frontend**: React 19, Vite, Tailwind CSS
- **Data Visualization**: Recharts, Lucide React
- **AI Integration**: Event-driven analysis via @google/genai

## Getting Started

### Prerequisites
- Go 1.21+
- Node.js & NPM

### Installation
```bash
git clone git@github.com:carbon-evolution/ReconGo.git
cd ReconGo
npm install
# Build the Go engine
go build -o recongo ./cmd/engine
```

### Running Locally
```bash
npm run dev
./recongo --config config.yaml
```

## License
MIT License - See the [LICENSE](LICENSE) file for details.
