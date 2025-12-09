import { Kafka, type Producer, type Consumer } from "kafkajs";
import fs from "fs";
import path from "path";
import prismaClient from "./prisma.js";

const kafka = new Kafka({
  brokers: [process.env.KAFKA_BROKER || ""],
  ssl: {
    ca: [fs.readFileSync(path.resolve("./ca.pem"), "utf-8")],
  },
  sasl: {
    username: process.env.KAFKA_USERNAME || "",
    password: process.env.KAFKA_PASSWORD || "",
    mechanism: "plain",
  },
});

let producer: null | Producer = null;
let consumer: null | Consumer = null;

export async function createProducer() {
  if (producer) return producer;

  const _producer = kafka.producer();
  await _producer.connect();
  producer = _producer;
  return producer;
}

export async function produceMessage(message: string) {
  const producer = await createProducer();
  await producer.send({
    messages: [{ key: `message-${Date.now()}`, value: message }],
    topic: "MESSAGES",
  });
  return true;
}

export async function createConsumer(groupId: string) {
  if (consumer) return consumer;

  const _consumer = kafka.consumer({ groupId });
  await _consumer.connect();
  consumer = _consumer;
  return consumer;
}

export async function startMessageConsumer() {
  console.log("Starting Kafka Consumer...");
  const consumer = await createConsumer("message-consumer-group");
  
  await consumer.subscribe({ topic: "MESSAGES", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log("Kafka message received:", {
        partition,
        offset: message.offset,
        value: message.value?.toString(),
      });

      if (message.value) {
        const messageText = message.value.toString();
        
        try {
          // Save to database
          await prismaClient.message.create({
            data: {
              text: messageText,
            },
          });
          console.log("Message saved to database:", messageText);
        } catch (error) {
          console.error("Error saving message to database:", error);
          console.log("Pausing consumer for 1 minute...");
          
          // Pause the consumer
          consumer.pause([{ topic: "MESSAGES" }]);
          
          // Resume after 1 minute
          setTimeout(() => {
            console.log("Resuming consumer...");
            consumer.resume([{ topic: "MESSAGES" }]);
          }, 60000); // 60000ms = 1 minute
        }
      }
    },
  });
}

export default kafka;