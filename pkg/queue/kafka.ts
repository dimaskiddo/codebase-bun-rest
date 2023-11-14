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
var consumer: Map<string, kafka.Consumer>

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
              await producer.get(clientId)?.connect()
            }
            break      
          case "consumer":
            let consumerOpts: kafka.ConsumerConfig = {
              groupId: groupId,
              allowAutoTopicCreation: false,
              partitionAssigners: [kafka.PartitionAssigners.roundRobin],
              retry: {
                retries: 0
              }
            }

            if (validate.isEmpty(consumer.get(clientId))) {
              consumer.set(clientId, new kafka.Kafka(kafkaOpts).consumer(consumerOpts))
              await consumer.get(clientId)?.connect()
            }
            break
        }
      } catch(err: any) {
        log.error(ctx, "[" + clientId + "] Failed to Connect Kafka Queue")

        switch (type) {
          case "producer":
            await producer.get(clientId)?.disconnect()
            producer.delete(clientId)
            break
          case "consumer":
            await consumer.get(clientId)?.disconnect()
            consumer.delete(clientId)
            break
        }
      }
    }
  }
}

export async function produce(clientId: string, topic: string, message: string) {
  const ctx = "queue-kafka-produce"

  if (producer.has(clientId)) {
    if (!validate.isEmpty(producer.get(clientId))) {
      try {
        await producer.get(clientId)?.send({
          topic: topic,
          compression: kafka.CompressionTypes.Snappy,
          messages: [{
            value: message
          }]
        })
        return true
      } catch(err: any) {
        log.error(ctx, "[" + clientId + "] Failed to Produce Message to Kafka Queue Caused By " + string.strToTitleCase(err.message))
      }
    } else {
      log.error(ctx, "[" + clientId + "] Kafka Client is Uninitialized")      
    }
  } else {
    log.error(ctx, "[" + clientId + "] Kafka Client Not Found")
  }

  return false
}

export async function consume(clientId: string, topic: string, callback: (message: string) => Promise<void>) {
  const ctx = "queue-kafka-consume"

  if (consumer.has(clientId)) {
    if (!validate.isEmpty(consumer.get(clientId))) {
      try {
        consumer.get(clientId)?.subscribe({
          topic: topic
        })

        consumer.get(clientId)?.run({
          autoCommit: false,
          eachMessage: async ({topic: cTopic, partition: cPartition, message: cMessage, heartbeat: cHeartbeat}) => {
            if (cTopic === topic) {
              let message = cMessage.value?.toString() || ""
              try {
                let isProcessed = await callback(message).then(() => true)
                if (isProcessed) {
                  await consumer.get(clientId)?.commitOffsets([{
                    topic: cTopic,
                    partition: cPartition,
                    offset: cMessage.offset + 1
                  }])
                  log.info(ctx, "[" + clientId + "] Successfully Consume Message with Topic \""+ cTopic +"\" in Partition " + cPartition.toString() + " from Kafka Queue")
                }
              } catch(err: any) {
                log.error(ctx, "[" + clientId + "] Failed to Consume Message from Kafka Queue Caused By " + string.strToTitleCase(err.message))
              } finally {
                await cHeartbeat()
              }
            }
          }
        })
      } catch(err: any) {
        log.error(ctx, "[" + clientId + "] Failed to Consume Message from Kafka Queue Caused By " + string.strToTitleCase(err.message))
      }
    } else {
      log.error(ctx, "[" + clientId + "] Kafka Client is Uninitialized")      
    }
  } else {
    log.error(ctx, "[" + clientId + "] Kafka Client Not Found")
  }
}

export async function close() {
  const ctx = "queue-kafka-close"

  producer.forEach(async (connection: kafka.Producer, clientId: string) => {
    if (producer.has(clientId)) {
      if (!validate.isEmpty(producer.get(clientId))) {
        try {
          await connection.disconnect()
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
          await connection.disconnect()
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
