import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';

const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318';

const sdk = new NodeSDK({
  serviceName: process.env.OTEL_SERVICE_NAME || 'acp-merchant',
  traceExporter: new OTLPTraceExporter({
    url: `${otlpEndpoint}/v1/traces`,
  }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      url: `${otlpEndpoint}/v1/metrics`,
    }),
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      // fs instrumentation is very noisy — disable it
      '@opentelemetry/instrumentation-fs': { enabled: false },
    }),
  ],
});

sdk.start();
