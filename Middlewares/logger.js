const winston=require('winston')

const logger=winston.createLogger({
    format:winston.format.combine(
        winston.format.timestamp({
            format:'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.colorize(),
        winston.format.printf(info=>`${info.timestamp} ${info.level}, ${info.message}`)
    ),
    transports:[
        new winston.transports.Console(),
        new winston.transports.File({filename: 'logs/error.log',level:'error'}),
        new winston.transports.File({filename: 'logs/combined.log',level:'info'})

    ]
})
const expressLogger=(req,res,next)=>{
    logger.info(`${req.method} ${req.url}`)
    next()
}

module.exports={expressLogger,logger}