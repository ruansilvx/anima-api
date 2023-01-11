import app from './app.js'
import chalk from 'chalk'
import logger from 'morgan'
const port = 4000

app.use(logger('dev'))
app.listen(port, () => console.log(`Anima api is listening on port ${chalk.green(port)}`))