import kafka from "kafkajs"
import validate from "validate.js"

import * as config from "@pkg/config"

import * as log from "@utils/logger"
import * as string from "@utils/string"

enum ConnectionType {
  producer = "producer",
  consumer = "consumer"
}

var producer: Map<string, kafka.Producer>
export var consumer: Map<string, kafka.Consumer>

export async function connect(clientId: string, groupId: string, type: ConnectionType) {
  const ctx = "queue-kafka-connect"

  if (config.schema.get("kafka.enabled")) {
    if (!producer.has(clientId) || !consumer.has(clientId)) {
      let kafkaOpts: kafka.KafkaConfig = {
        clientId: type + "::" + clientId,
        logLevel: kafka.logLevel.INFO,
        brokers: config.schema.get("kafka.host"),
        ssl: config.schema.get("kafka.ssl")
      }

      switch (config.schema.get("kafka.mechanism")) {
        case "plain":
          kafkaOpts = {
            ...kafkaOpts,
            sasl: {
              mechanism: "plain",
              username: config.schema.get("kafka.username"),
              password: config.schema.get("kafka.password")
            }
          }
          break
        case "scram-sha-256":
          kafkaOpts = {
            ...kafkaOpts,
            sasl: {
              mechanism: "scram-sha-256",
              username: config.schema.get("kafka.username"),
              password: config.schema.get("kafka.password")
            }
          }
          break
        case "scram-sha-512":
          kafkaOpts = {
            ...kafkaOpts,
            sasl: {
              mechanism: "scram-sha-512",
              username: config.schema.get("kafka.username"),
              password: config.schema.get("kafka.password")
            }
          }
          break
      }

      try {
        switch (type) {
          case "producer":
            let producerOpts: kafka.ProducerConfig = {
              allowAutoTopicCreation: false,
              transactionTimeout: 30000
            }

            if (validate.isEmpty(producer.get(clientId))) {
              producer.set(clientId, new kafka.Kafka(kafkaOpts).producer(producerOpts))
              producer.get(clientId)?.connect()
            }
            break      
          case "consumer":
            let consumerOpts: kafka.ConsumerConfig = {
              groupId: groupId,
              allowAutoTopicCreation: false,
              partitionAssigners: [kafka.PartitionAssigners.roundRobin]
            }

            if (validate.isEmpty(consumer.get(clientId))) {
              consumer.set(clientId, new kafka.Kafka(kafkaOpts).consumer(consumerOpts))
              consumer.get(clientId)?.connect()
            }
            break
        }
      } catch(err: any) {
        log.error(ctx, "[" + clientId + "] Failed to Connect Kafka Queue")
      }
    }
  }
}

export async function send(clientId: string, topic: string, data: string) {
  const ctx = "queue-kafka-send"

  if (producer.has(clientId)) {
    if (!validate.isEmpty(producer.get(clientId))) {
      try {
        await producer.get(clientId)?.send({
          topic: topic,
          compression: kafka.CompressionTypes.Snappy,
          messages: [{
            value: data
          }]
        })
        return true
      } catch(err: any) {
        log.error(ctx, "[" + clientId + "] Failed to Send Message to Kafka Queue Caused By " + string.strToTitleCase(err.message))
      }
    } else {
      log.error(ctx, "[" + clientId + "] Kafka Client is Uninitialized")      
    }
  } else {
    log.error(ctx, "[" + clientId + "] Kafka Client Not Found")
  }

  return false
}

export async function close() {
  const ctx = "queue-kafka-close"

  producer.forEach(async (connection: kafka.Producer, clientId: string) => {
    if (producer.has(clientId)) {
      if (!validate.isEmpty(producer.get(clientId))) {
        try {
          await producer.get(clientId)?.disconnect()
        } catch(err: any) {
          log.error(ctx, "[" + clientId + "] Failed to Close Kafka Queue")
        }
      } else {
        log.error(ctx, "[" + clientId + "] Kafka Client is Uninitialized")      
      }
    } else {
      log.error(ctx, "[" + clientId + "] Kafka Client Not Found")
    }
  })

  consumer.forEach(async (connection: kafka.Consumer, clientId: string) => {
    if (consumer.has(clientId)) {
      if (!validate.isEmpty(consumer)) {
        try {
          await consumer.get(clientId)?.disconnect()
        } catch(err: any) {
          log.error(ctx, "[" + clientId + "] Failed to Close Kafka Queue")
        }
      } else {
        log.error(ctx, "[" + clientId + "] Kafka Client is Uninitialized")      
      }
    } else {
      log.error(ctx, "[" + clientId + "] Kafka Client Not Found")
    }    
  })
}
