export async function register() {
  // Only run on the Node.js server runtime, not in the Edge runtime or browser
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { NodeSDK } = await import('@opentelemetry/sdk-node');
    const { OTLPTraceExporter } = await import('@opentelemetry/exporter-trace-otlp-proto');
    const { OTLPMetricExporter } = await import('@opentelemetry/exporter-metrics-otlp-proto');
    const { PeriodicExportingMetricReader } = await import('@opentelemetry/sdk-metrics');

    const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318';

    const sdk = new NodeSDK({
      serviceName: process.env.OTEL_SERVICE_NAME || 'acp-chat-client',
      traceExporter: new OTLPTraceExporter({
        url: `${otlpEndpoint}/v1/traces`,
      }),
      metricReader: new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter({
          url: `${otlpEndpoint}/v1/metrics`,
        }),
      }),
    });

    sdk.start();
  }
}
