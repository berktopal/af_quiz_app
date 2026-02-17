const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const fs = require('fs')
const Question = require('./models/Question')
const Score = require('./models/Score') // ⭐️ Score modelini ekledik

const app = express()
app.use(cors())
app.use(express.json())

mongoose.connect('mongodb://127.0.0.1:27017/af-quiz')
  .then(() => console.log('MongoDB bağlantısı başarılı'))
  .catch(err => console.error('MongoDB bağlantı hatası:', err))

// 🔄 Rastgele 10 soru getir
app.get('/api/questions', async (req, res) => {
  try {
    const questions = await Question.aggregate([{ $sample: { size: 10 } }])
    res.json(questions)
  } catch (err) {
    console.error('Soru çekme hatası:', err)
    res.status(500).json({ error: 'Soru getirilirken hata oluştu' })
  }
})

// 📥 Soruları JSON dosyasından veritabanına yükle
app.post('/api/import', async (req, res) => {
  try {
    const data = fs.readFileSync('./data/af_quiz_questions_50.json', 'utf-8')
    const questions = JSON.parse(data)
    await Question.deleteMany()
    await Question.insertMany(questions)
    res.send({ message: 'Sorular başarıyla yüklendi!' })
  } catch (err) {
    console.error('İçe aktarma hatası:', err)
    res.status(500).send({ error: 'Veri yüklenemedi' })
  }
})

// 📌 PUAN KAYDET
// 📌 PUAN KAYDET (Tekrarı engelle)
app.post('/api/scores', async (req, res) => {
  try {
    const { username, score, total, avatar } = req.body

    // Aynı kullanıcı aynı skorla varsa tekrar kaydetme
    const existing = await Score.findOne({ username, score, total, avatar })
    if (existing) {
      return res.status(200).json({ message: 'Bu skor zaten kaydedilmiş' })
    }

    const newScore = new Score({ username, score, total, avatar })
    await newScore.save()
    res.json({ message: 'Puan başarıyla kaydedildi' })
  } catch (err) {
    console.error('Puan kaydetme hatası:', err)
    res.status(500).json({ error: 'Puan kaydedilemedi' })
  }
})



// 📊 PUANLARI GETİR (EN YÜKSEK 10)
app.get('/api/scores', async (req, res) => {
  try {
    const scores = await Score.find().sort({ score: -1, date: -1 }).limit(10)
    res.json(scores)
  } catch (err) {
    console.error('Puan getirme hatası:', err)
    res.status(500).json({ error: 'Puanlar alınamadı' })
  }
})

app.listen(5000, () => {
  console.log('Server 5000 portunda çalışıyor')
})

// 🧹 Tek bir skoru sil
app.delete('/api/scores/:id', async (req, res) => {
  try {
    await Score.findByIdAndDelete(req.params.id)
    res.json({ message: 'Skor silindi' })
  } catch (err) {
    console.error('Silme hatası:', err)
    res.status(500).json({ error: 'Silinemedi' })
  }
})

