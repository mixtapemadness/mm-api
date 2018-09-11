
module.exports = {
  port: 8001,
  HTTP_HOST: 'http://localhost:8001',
  database: {
    connection: 'mongodb://localhost:27017/mixtape'
    // connection : 'mongodb://mixtape:V0bi!qwerty1$@db.vobi.io/booking'
    // connection: 'mongodb://develop:JXpKN5VK9H7LJsLP@develop-shard-00-00-4m7yb.mongodb.net:27017,develop-shard-00-01-4m7yb.mongodb.net:27017,develop-shard-00-02-4m7yb.mongodb.net:27017/test?ssl=true&replicaSet=Develop-shard-0&authSource=admin'
  },
  mailgun: {
    apiKey: 'key-',
    domainForMailgun: 'test.mixtape.com',
    defaultFrom: 'service@test.mixtape.com',
    domainInTemplate: 'https://test.mixtape.com',
    frontendUrl: 'https://test.mixtape.com'
  },
  systemEmail: 'service@test.mixtape.com',
  stripeKey: 'sk_test_Dhb6ICQkc3hWBCaF1C5IPAI9',
  front_url: 'http://localhost:9000',
  back_url: 'http://localhost:8001'
}
