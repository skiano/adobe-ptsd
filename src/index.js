/**
 * `configuration` and `passedArgs`
 * are injected into the bundle via a rollup plugin
 */
import configuration from 'nodobe/config'
import passedArgs from 'nodobe/args'

/**
 * `configuration` and `argv`
 * are exposed so that user scripts can
 * use custom configuration or arguments
 */
export const config = configuration
export const argv = passedArgs

/**
 * useful scripts may be exported here
 * so that users can take advantage of them
 */
