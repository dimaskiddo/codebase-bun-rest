import dotenv from "dotenv"

import convict from "convict"
import convictValidator from "convict-format-with-validator"

import * as pkg from "@pkg/json"

convict.addFormat(convictValidator.ipaddress)
export const schema = convict({
  timezone: {
    doc: "The Application Timezone",
    format: String,
    default: "Asia/Jakarta",
    env: "TZ"
  },
  environment: {
    doc: "The Application Environment",
    format: ["development", "production", "test"],
    default: "development",
    env: "ENVIRONMENT"
  },
  log: {
    level: {
      doc: "The Application Log Level",
      format: ["debug", "verbose", "info", "warn", "error"],
      default: "info",
      env: "LOG_LEVEL"
    }
  },
  server: {
    address: {
      doc: "The Application Address to Listen",
      format: "ipaddress",
      default: "0.0.0.0",
      env: "SERVER_ADDRESS"
    },
    port: {
      doc: "The Application Port to Listen",
      format: "port",
      default: 3000,
      env: "SERVER_PORT"
    },
    router: {
      path: {
        doc: "The Application Base Path URL",
        format: String,
        default: "/",
        env: "SERVER_ROUTER_PATH"
      }
    },
    proxy: {
      trust: {
        doc: "The Application Proxy Trust Configuration",
        format: Boolean,
        default: true,
        env: "SERVER_PROXY_TRUST"
      }
    },
    upload: {
      path: {
        doc: "The Application Upload Path",
        format: String,
        default: "./misc/public/uploads",
        env: "SERVER_UPLOAD_PATH"
      },
      limit: {
        doc: "The Application Upload Limit Size",
        format: Number,
        default: 8,
        env: "SERVER_UPLOAD_LIMIT"
      }
    },
    cors: {
      origins: {
        doc: "The Application CORS Origins",
        format: String,
        default: "*",
        env: "SERVER_CORS_ORIGINS"
      },
      methods: {
        doc: "The Application CORS Methods",
        format: String,
        default: "GET, POST, PUT, PATCH, DELETE, OPTIONS",
        env: "SERVER_CORS_METHODS"
      },
      headers: {
        doc: "The Application CORS Headers",
        format: String,
        default: "Origin, X-Requested-With, Content-Type, Accept, Authorization",
        env: "SERVER_CORS_HEADERS"
      }
    },
  },
  key: {
    private: {
      doc: "The Application Private Key Path",
      format: String,
      default: "./misc/keys/private.pem",
      env: "SERVER_KEYS_PRIVATE"
    },
    public: {
      doc: "The Application Public Key Path",
      format: String,
      default: "./misc/keys/public.pem",
      env: "SERVER_KEYS_PUBLIC"
    }
  },
  jwt: {
    issuer: {
      doc: "JWT Token Issuer",
      format: String,
      default: pkg.name,
      env: "JWT_TOKEN_ISSUER"
    },
    audience: {
      doc: "JWT Token Audience",
      format: String,
      default: "1f3730ca-776a-4420-ad17-cf0acb31d10c",
      env: "JWT_TOKEN_AUDIENCE"
    },
    expired: {
      doc: "JWT Token Expiration",
      format: String,
      default: "1d",
      env: "JWT_TOKEN_EXPIRED"
    },
    refresh: {
      doc: "JWT Refresh Expiration",
      format: String,
      default: "90d",
      env: "JWT_REFRESH_EXPIRED"
    }
  },
  rdb: {
    driver: {
      doc: "Relational Database Driver",
      format: String,
      default: "",
      env: "RDB_DRIVER"
    },
    host: {
      doc: "Relational Database Host",
      format: String,
      default: "127.0.0.1",
      env: "RDB_HOST"
    },
    port: {
      doc: "Relational Database Port",
      format: Number,
      default: 3306,
      env: "RDB_PORT"
    },
    username: {
      doc: "Relational Database Username",
      format: String,
      default: "",
      env: "RDB_USERNAME"
    },
    password: {
      doc: "Relational Database Password",
      format: String,
      default: "",
      env: "RDB_PASSWORD"
    },
    name: {
      doc: "Relational Database Name",
      format: String,
      default: "",
      env: "RDB_NAME"
    }
  },
  redis: {
    enabled: {
      doc: "Redis Enabled",
      format: Boolean,
      default: false,
      env: "REDIS_ENABLED"
    },
    host: {
      doc: "Redis Host",
      format: String,
      default: "127.0.0.1",
      env: "REDIS_HOST"
    },
    port: {
      doc: "Redis Port",
      format: Number,
      default: 6379,
      env: "REDIS_PORT"
    },
    password: {
      doc: "Redis Password",
      format: String,
      default: "",
      env: "REDIS_PASSWORD"
    },
    database: {
      doc: "Redis Database",
      format: Number,
      default: 0,
      env: "REDIS_DATABASE"
    }
  },
  kafka: {
    enabled: {
      doc: "Kafka Enabled",
      format: Boolean,
      default: false,
      env: "KAFKA_ENABLED"
    },
    host: {
      doc: "Kafka Host",
      format: Array,
      default: ["127.0.0.1:9092"],
      env: "KAFKA_HOST"
    },
    ssl: {
      doc: "Kafka Use SSL",
      format: Boolean,
      default: false,
      env: "KAFKA_USE_SSL"
    },
    username: {
      doc: "Kafka Username",
      format: String,
      default: "",
      env: "KAFKA_USERNAME"
    },
    password: {
      doc: "Kafka Password",
      format: String,
      default: "",
      env: "KAFKA_PASSWORD"
    },
    mechanism: {
      doc: "Kafka Mechanism",
      format: String,
      default: "",
      env: "KAFKA_MECHANISM"
    }
  },
  store: {
    driver: {
      doc: "Storage Driver",
      format: String,
      default: "",
      env: "STORE_DRIVER"
    },
    endpoint: {
      doc: "Storage Endpoint",
      format: String,
      default: "",
      env: "STORE_ENDPOINT"
    },
    accesskey: {
      doc: "Storage Access Key",
      format: String,
      default: "",
      env: "STORE_ACCESS_KEY"
    },
    secretkey: {
      doc: "Storage Secret Key",
      format: String,
      default: "",
      env: "STORE_SECRET_KEY"
    },
    region: {
      doc: "Storage Region",
      format: String,
      default: "us-east-1",
      env: "STORE_REGION"
    },
    bucket: {
      private: {
        doc: "Storage Private Bucket",
        format: String,
        default: "",
        env: "STORE_BUCKET_PRIVATE"
      },
      public: {
        doc: "Storage Public Bucket",
        format: String,
        default: "",
        env: "STORE_BUCKET_PUBLIC"
      }
    },
    port: {
      doc: "Storage Port",
      format: "port",
      default: 443,
      env: "STORE_PORT"
    },
    ssl: {
      doc: "Storage Use SSL",
      format: Boolean,
      default: true,
      env: "STORE_USE_SSL"
    },
    expired: {
      doc: "Storage Private URL Expiration",
      format: Number,
      default: 86400,
      env: "STORE_URL_EXPIRED"
    }
  },
  mail: {
    enabled: {
      doc: "Mail Enabled",
      format: Boolean,
      default: false,
      env: "MAIL_ENABLED"
    },
    service: {
      doc: "Mail Service",
      format: String,
      default: "",
      env: "MAIL_SERVICE"
    },
    sender: {
      doc: "Mail Sender Name",
      format: String,
      default: "",
      env: "MAIL_SENDER_NAME"
    },
    username: {
      doc: "Mail Username",
      format: String,
      default: "",
      env: "MAIL_USERNAME"
    },
    password: {
      doc: "Mail Password",
      format: String,
      default: "",
      env: "MAIL_PASSWORD"
    },
    host: {
      doc: "Mail Host",
      format: String,
      default: "",
      env: "MAIL_HOST"
    },
    port: {
      doc: "Mail Port",
      format: Number,
      default: 465,
      env: "MAIL_PORT"
    }
  }
})

schema.validate({allowed: "strict"})
dotenv.config()
