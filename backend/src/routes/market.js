import express from 'express';
import Joi from 'joi';
import Instrument from '../models/Instrument.js';
import Candle from '../models/Candle.js';

const router = express.Router();

router.get('/instruments', async (req, res) => {
  const list = await Instrument.find({ active: true }).lean();
  res.json(list);
});

// router.get('/candles', async (req, res) => {
//   const schema = Joi.object({
//     symbol: Joi.string().uppercase().required(),
//     timeframe: Joi.string().valid('1m','5m','15m','1h','1d').default('1m'),
//     limit: Joi.number().min(1).max(500).default(100)
//   })

//   const { error, value } = schema.validate(req.query)
//   if (error) return res.status(400).json({ message: error.message })

//   const items = await Candle.find({ 
//     symbol: value.symbol, 
//     timeframe: value.timeframe 
//   })
//     .sort({ ts: -1 })
//     .limit(value.limit)
//     .lean()

//   res.json(items.reverse())
// })

router.get('/candles', async (req, res) => {
  const schema = Joi.object({
    symbol: Joi.string().uppercase().required(),
    timeframe: Joi.string().valid('1m','5m','15m','1h','1d').default('1m'),
    limit: Joi.number().min(1).max(500).default(100)
  })

  const { error, value } = schema.validate(req.query)
  if (error) return res.status(400).json({ message: error.message })

  try {
    let items = []

    if (value.timeframe === '1m') {
      // ✅ Directly fetch 1m candles from DB
      items = await Candle.find({ symbol: value.symbol, timeframe: '1m' })
        .sort({ ts: -1 })
        .limit(value.limit)
        .lean()
    } else {
      // ✅ Aggregate from 1m candles into higher timeframe
      let groupStage = {}

      if (value.timeframe === '5m') {
        groupStage = {
          year: { $year: "$ts" },
          month: { $month: "$ts" },
          day: { $dayOfMonth: "$ts" },
          hour: { $hour: "$ts" },
          minute: { $subtract: [{ $minute: "$ts" }, { $mod: [{ $minute: "$ts" }, 5] }] }
        }
      } else if (value.timeframe === '15m') {
        groupStage = {
          year: { $year: "$ts" },
          month: { $month: "$ts" },
          day: { $dayOfMonth: "$ts" },
          hour: { $hour: "$ts" },
          minute: { $subtract: [{ $minute: "$ts" }, { $mod: [{ $minute: "$ts" }, 15] }] }
        }
      } else if (value.timeframe === '1h') {
        groupStage = {
          year: { $year: "$ts" },
          month: { $month: "$ts" },
          day: { $dayOfMonth: "$ts" },
          hour: { $hour: "$ts" }
        }
      } else if (value.timeframe === '1d') {
        groupStage = {
          year: { $year: "$ts" },
          month: { $month: "$ts" },
          day: { $dayOfMonth: "$ts" }
        }
      }

      items = await Candle.aggregate([
        { $match: { symbol: value.symbol, timeframe: '1m' } }, // use raw 1m data
        {
          $group: {
            _id: groupStage,
            open: { $first: "$open" },
            high: { $max: "$high" },
            low: { $min: "$low" },
            close: { $last: "$close" },
            volume: { $sum: "$volume" },
            ts: { $first: "$ts" } // take first timestamp as bucket time
          }
        },
        { $sort: { ts: -1 } },
        { $limit: value.limit }
      ])
    }

    res.json(items.reverse())
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})




export default router;


