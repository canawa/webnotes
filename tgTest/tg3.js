import { Telegraf, Markup } from 'telegraf';
import crypto from 'crypto';

// Инициализация бота
const bot = new Telegraf('7730895131:AAGnU5zBgJ32jaKvClohwfa3MQvqkFjck7c');

// Локальное хранилище пользовательских данных
const users = {};

// Коэффициенты с преимуществом казино 5%
const COEFFICIENTS = [
  1.14,   // 5/6
  1.1875, // 4/5
  1.2667, // 3/4
  1.425,  // 2/3
  1.9     // 1/2
];

// Функция для создания клавиатуры в зависимости от состояния игры
const getKeyboard = (isGameActive) => {
  if (isGameActive) {
    return Markup.keyboard([
      ['Стрелять', 'Забрать'],
      ['Баланс']
    ]).resize();
  } else {
    return Markup.keyboard([
      ['Стрелять', 'Поставить 100'],
      ['Баланс']
    ]).resize();
  }
};

bot.start((ctx) => {
  const userId = ctx.from.id;
  
  // Инициализация пользователя при первом запуске
  if (!users[userId]) {
    users[userId] = {
      balance: 1000,
      currentBet: 0,
      currentStep: 0,
      gameActive: false,
      potentialWin: 0
    };
  }

  ctx.reply('Добро пожаловать в игру!', getKeyboard(false));
});

// Обработка ставок
bot.hears(/Поставить (\d+)/, (ctx) => {
  const userId = ctx.from.id;
  const user = users[userId];
  const betAmount = parseInt(ctx.match[1]);

  if (user.balance < betAmount) {
    return ctx.reply('Недостаточно средств!');
  }

  user.currentBet = betAmount;
  user.currentStep = 0;
  user.balance -= betAmount;
  user.gameActive = false;
  user.potentialWin = 0;

  ctx.reply(`Ставка ${betAmount} принята! `);
});

// Функция задержки
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Обработка кнопки "Забрать"
bot.hears('Забрать', (ctx) => {
  const userId = ctx.from.id;
  const user = users[userId];

  if (!user.currentBet || !user.gameActive) {
    return ctx.reply('Нет активной игры!');
  }

  // Рассчитываем выигрыш на текущем шаге
  const currentCoefficient = COEFFICIENTS[user.currentStep - 1];
  const winAmount = Math.floor(user.currentBet * currentCoefficient);
  
  // Зачисляем выигрыш на баланс
  user.balance += winAmount;
  
  // Обнуляем ставку и шаг
  user.currentBet = 0;
  user.currentStep = 0;
  user.gameActive = false;
  user.potentialWin = 0;
  
  ctx.reply(`Вы забрали выигрыш ${winAmount}! Ваш баланс: ${user.balance}`, getKeyboard(false));
});

// Основная логика выстрелов
bot.hears('Стрелять', async (ctx) => {
  const userId = ctx.from.id;
  const user = users[userId];

  if (!user.currentBet) {
    return ctx.reply('Сначала сделайте ставку!');
  }

  const currentStep = user.currentStep;

  // Проверка на последний шаг
  if (currentStep >= COEFFICIENTS.length) {
    // Рассчитываем максимальный выигрыш
    const maxCoefficient = COEFFICIENTS[COEFFICIENTS.length - 1];
    const maxWin = Math.floor(user.currentBet * maxCoefficient);
    
    // Зачисляем выигрыш на баланс
    user.balance += maxWin;
    
    // Обнуляем ставку и шаг
    user.currentBet = 0;
    user.currentStep = 0;
    user.gameActive = false;
    user.potentialWin = 0;
    
    return ctx.reply(`🎉 Максимальный выигрыш ${maxWin}! Ваш баланс: ${user.balance}`, getKeyboard(false));
  }

  // Логика выстрела
  const randomNumber = crypto.randomInt(1, 6 - currentStep);
  const isHit = randomNumber === 1;

  if (isHit) {
    const lostBet = user.currentBet;
    user.currentBet = 0;
    user.currentStep = 0;
    user.gameActive = false;
    user.potentialWin = 0;
    
    await ctx.replyWithAnimation({ source: 'shoot.mp4' });
    // Ждем 6 секунд перед отправкой результата
    await delay(6000);
    ctx.reply(`💥 Вы проиграли! Ставка ${lostBet} сгорела.`, getKeyboard(false));
  } else {
    // Увеличиваем шаг
    user.currentStep = currentStep + 1;
    
    // Рассчитываем потенциальный выигрыш на текущем шаге
    const currentCoefficient = COEFFICIENTS[currentStep];
    const potentialWin = Math.floor(user.currentBet * currentCoefficient);
    user.potentialWin = potentialWin;
    
    // Активируем игру после первого успешного выстрела
    user.gameActive = true;

    await ctx.replyWithAnimation({ source: 'miss.mp4' });
    // Ждем 6 секунд перед отправкой результата
    await delay(6000);
    
    if (user.currentStep < COEFFICIENTS.length) {
      const nextCoefficient = COEFFICIENTS[user.currentStep];
      const nextPotentialWin = Math.floor(user.currentBet * nextCoefficient);
      
      ctx.reply(
        `🎯 Успешно! Текущий выигрыш: ${potentialWin} (${user.currentBet} × ${currentCoefficient}). Следующий коэффициент: ${nextCoefficient} (${nextPotentialWin})`,
        getKeyboard(true)
      );
    } else {
      // Если достигли последнего шага, показываем максимальный коэффициент
      ctx.reply(
        `🎯 Успешно! Текущий выигрыш: ${potentialWin} (${user.currentBet} × ${currentCoefficient}). Это последний шаг!`,
        getKeyboard(true)
      );
    }
  }
});

// Проверка баланса
bot.hears('Баланс', (ctx) => {
  const userId = ctx.from.id;
  const user = users[userId];
  
  let message = `Ваш баланс: ${user.balance}`;
  
  // Если есть активная игра, показываем потенциальный выигрыш
  if (user.gameActive && user.potentialWin > 0) {
    message += `\nПотенциальный выигрыш: ${user.potentialWin}`;
  }
  
  ctx.reply(message);
});

// Обработка текстового ввода (пользовательская ставка)
bot.on('text', (ctx) => {
  const userId = ctx.from.id;
  const user = users[userId];
  const input = ctx.message.text.trim();

  // Проверяем, является ли введённый текст числом
  if (!isNaN(input) && input > 0) {
    const betAmount = parseInt(input);

    // Проверяем, достаточно ли средств на балансе
    if (user.balance < betAmount) {
      return ctx.reply('Недостаточно средств!');
    }

    // Принимаем ставку
    user.currentBet = betAmount;
    user.currentStep = 0;
    user.balance -= betAmount;
    user.gameActive = false;
    user.potentialWin = 0;

    ctx.reply(`Ставка ${betAmount} принята! Текущий коэффициент: ${COEFFICIENTS[0]}`);
  }
});

bot.launch();
console.log('Бот запущен!');