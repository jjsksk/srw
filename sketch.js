let video;
let detections = {};
let faceapi;
let emotion = "😐";
let score = 50;
let feedback = "";
let speechRec;
let userSpeech = "";

const detectionOptions = {
  withLandmarks: true,
  withDescriptors: false,
  withExpressions: true,
};

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  faceapi = ml5.faceApi(video, detectionOptions, modelReady);

  // 啟動語音辨識
  let lang = navigator.language || 'en-US';
  speechRec = new p5.SpeechRec(lang, gotSpeech);
  speechRec.continuous = false;
  speechRec.interimResults = false;

  let btn = createButton("開始告白");
  btn.position(10, height + 10);
  btn.mousePressed(() => {
    userSpeech = "";
    speechRec.start();
  });
}

function modelReady() {
  console.log("FaceAPI ready!");
  faceapi.detect(gotResults);
}

function gotResults(err, result) {
  if (err) {
    console.error(err);
    return;
  }

  detections = result;

  if (detections && detections.length > 0) {
    let expressions = detections[0].expressions;
    emotion = getTopEmotion(expressions);
    score = calculateScore(emotion);
    feedback = generateFeedback(emotion);
  }

  faceapi.detect(gotResults);
}

function draw() {
  image(video, 0, 0, width, height);

  // 顯示表情、分數與回饋
  fill(255);
  textSize(20);
  textAlign(LEFT);
  text("目前表情：" + emotion, 10, 30);
  text("愛的分數：" + score + " 分", 10, 60);
  text("小老師建議：" + feedback, 10, 90);

  textSize(16);
  text("你剛才說的話：", 10, 130);
  text(userSpeech, 10, 160, width - 20);
}

function getTopEmotion(expressions) {
  let topEmotion = "neutral";
  let maxValue = 0;
  for (let expr in expressions) {
    if (expressions[expr] > maxValue) {
      topEmotion = expr;
      maxValue = expressions[expr];
    }
  }
  const emojis = {
    happy: "😊",
    sad: "😢",
    angry: "😠",
    surprised: "😮",
    fearful: "😨",
    disgusted: "🤢",
    neutral: "😐",
  };
  return emojis[topEmotion] || "😐";
}

function calculateScore(emotion) {
  switch (emotion) {
    case "😊": return 90;
    case "😢": return 40;
    case "😠": return 30;
    case "😮": return 70;
    case "😨": return 20;
    case "🤢": return 10;
    case "😐": return 50;
    default: return 50;
  }
}

function generateFeedback(emotion) {
  switch (emotion) {
    case "😊": return "太棒了！這個笑容超加分～";
    case "😐": return "太冷靜了，再熱情一點吧！";
    case "😢": return "不要哭啦～告白不是悲劇片";
    case "😠": return "哇冷靜一點，愛不是憤怒喔！";
    case "😨": return "看起來很緊張，深呼吸再試一次～";
    case "🤢": return "呃…可能真的不適合現在表白XD";
    case "😮": return "對方會不會被你嚇到呀？再自然一點～";
    default: return "再試一次，讓AI小老師幫你加油！";
  }
}

function gotSpeech() {
  if (speechRec.resultValue) {
    userSpeech = speechRec.resultString;
  }
}
