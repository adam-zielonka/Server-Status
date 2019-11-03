import { gql } from 'apollo-server'

export default gql`
  type Host {
    name: String
    port: Float
    open: Boolean
  }

  type Service {
    name: String
    port: Float
    link: String
    hosts: [Host]
  }
`
