from fastapi import FastAPI
import secrets
from pydantic import BaseModel
app = FastAPI()
result=0
symbols = (
    ['🍓'] * 150 +    # клубника - частый, маленькая выплата
    ['🍇'] * 120 +    # виноград
    ['🍌'] * 100 +    # банан
    ['🍎'] * 80 +    # яблоко
    ['🍉'] * 50  +    # арбуз
    ['🍰'] * 40  +    # торт - редкий, хорошая выплата
    ['⭐'] * 30  +    # звезда - средний
    ['💎'] * 25  +    # бриллиант - очень редкий, крупная выплата
    ['⚡'] * 25   +    # молния - бонус
    ['🍒'] * 130 +    # часто
    ['🍋'] * 120 +    # часто
    ['🔥'] * 20 +     # вайлды
    ['🚪'] * 10      # штора (визуально занимает все место, но по факту просто сверху накрывает символы) 
)





shutterMultiplier = (
    [2] * 50 +   # 40%
    [3] * 30 +   # 30%
    [5] * 10 +   # 15%
    [10] * 4 +  # 10%
    [25] * 2 +   # 4%
    [100] * 1    # 1%
)

@app.get('/bonus')
def bonusGame(bet:int,counter:int,gameResults: str):
    multiplier=1
    payout = 0
    spinsAmount = 10
    shutterPos=[]
    overallPayout=0
    for z in range(spinsAmount):
        result=[]
        payout=0
        for i in range(0,31):
            result.append(secrets.choice(symbols))
        for pos in range(len(shutterPos)):
            result[shutterPos[pos]]='🚪'
        
        column1=result[:5]
        column2=result[5:10]
        column3=result[10:15]
        column4=result[15:20]
        column5=result[20:25]
        column6=result[25:]
        if result.count('🔥')>=1:
            multiplier = 2*result.count('🔥')
        else:
            multiplier = 1

        if result.count('🍓')>=7:
            payout=(payout + bet*0.25)
            counter=counter+1
            gameResults = gameResults + 'Сыграли 🍓' + str(payout)
        if result.count('🍇')>=7:
            payout= (payout + bet*0.35)
            counter=counter+1
            gameResults = gameResults + 'Сыграли 🍇' + str(payout)
        if result.count('🍌')>=7:
            payout=(payout + bet*0.5)
            counter=counter+1
            gameResults = gameResults + 'Сыграли 🍌' + str(payout)
        if result.count('🍰')>=7:
            
            payout=(payout + bet*1)
            counter=counter+1
            gameResults = gameResults + 'Сыграли 🍰' + str(payout)
        if result.count('⭐')>=7:
            
            payout=(payout + bet*1.25)
            counter=counter+1
            gameResults = gameResults + 'Сыграли ⭐' +str( payout)
        if result.count('💎')>=7:
            
            payout=(payout + bet*1.5)
            counter=counter+1
            gameResults = gameResults + 'Сыграли 💎' + str(payout)
        if result.count('🍎')>=7:
            
            payout=(payout + bet*0.45)
            counter=counter+1
            gameResults = gameResults + 'Сыграли 🍎' + str(payout)
        if result.count('🍒')>=7:
            
            payout=(payout + bet*0.3)
            counter=counter+1
            gameResults = gameResults + 'Сыграли 🍒' + str(payout)
        if result.count('🍋')>=7:
            
            payout=(payout + bet*0.4)
            counter=counter+1
            gameResults = gameResults + 'Сыграли 🍋' + str(payout)
        if result.count('🍉')>=7:
            
            payout=(payout + bet*0.75)
            counter=counter+1
            gameResults = gameResults + 'Сыграли 🍉' + str(payout)
        if result.count('🚪')>=1:
            for i in range(result.count('🚪')):
                multiplier = multiplier + secrets.choice(shutterMultiplier)
            payout=payout*multiplier
            shutterPos.append(result.index('🚪'))

        else:
            payout=payout*multiplier
        if result.count('⚡')>=4:
            spinsAmount = spinsAmount+3
        overallPayout=overallPayout+payout

    return overallPayout
    


bonusCount =0
@app.get('/')
def spinTest():
    bet = 100
    counter = 0
    gameResults = ''
    result=[]
    multiplier=1
    payout=0
    bonusCount=0
    for i in range(0,30):
        result.append(secrets.choice(symbols))
    column1=result[:5]
    column2=result[5:10]
    column3=result[10:15]
    column4=result[15:20]
    column5=result[20:25]
    column6=result[25:]
    if result.count('🔥')>=1:
        multiplier = 2*result.count('🔥')
    else:
        multiplier = 1
        
    if result.count('🍓')>=7:
            payout=(payout + bet*0.25)
            counter=counter+1
            gameResults = gameResults + 'Сыграли 🍓' + str(payout)
    if result.count('🍇')>=7:
        payout= (payout + bet*0.35)
        counter=counter+1
        gameResults = gameResults + 'Сыграли 🍇' + str(payout)
    if result.count('🍌')>=7:
        payout=(payout + bet*0.5)
        counter=counter+1
        gameResults = gameResults + 'Сыграли 🍌' + str(payout)
    if result.count('🍰')>=7:
            
        payout=(payout + bet*1)
        counter=counter+1
        gameResults = gameResults + 'Сыграли 🍰' + str(payout)
    if result.count('⭐')>=7:
            
        payout=(payout + bet*1.25)
        counter=counter+1
        gameResults = gameResults + 'Сыграли ⭐' +str( payout)
    if result.count('💎')>=7:
            
        payout=(payout + bet*1.5)
        counter=counter+1
        gameResults = gameResults + 'Сыграли 💎' + str(payout)
    if result.count('🍎')>=7:
            
        payout=(payout + bet*0.45)
        counter=counter+1
        gameResults = gameResults + 'Сыграли 🍎' + str(payout)
    if result.count('🍒')>=7:
            
            payout=(payout + bet*0.3)
            counter=counter+1
            gameResults = gameResults + 'Сыграли 🍒' + str(payout)
    if result.count('🍋')>=7:
            
        payout=(payout + bet*0.4)
        counter=counter+1
        gameResults = gameResults + 'Сыграли 🍋' + str(payout)
    if result.count('🍉')>=7:
            
        payout=(payout + bet*0.75)
        counter=counter+1
        gameResults = gameResults + 'Сыграли 🍉' + str(payout)
    if result.count('🚪')>=1:
        for i in range(result.count('🚪')):
            multiplier = multiplier + secrets.choice(shutterMultiplier)
        payout=payout*multiplier
    else:
        payout=payout*multiplier
    if result.count('⚡')>=4:
        bonusCount += 1 
        payout = bonusGame(bet,counter,gameResults)
        gameResults = gameResults + 'Сыграла БОНУСКА 💵💵' + str(payout)
    else:
        bonusCount=0
    return {'payout':payout,'сколько символов сыграло': counter, 'bonusCount': bonusCount, 'что сыграло:': gameResults, 'multiplier':multiplier, 'column1':column1,'column2':column2,'column3':column3,'column4':column4,'column5':column5,'column6':column6}
    





@app.get('/stats')
def stats():
    t=[]
    o=[]
    for j in range(1,1000000):
        t.append(spinTest()['payout'])
    

    for p in range(1,1000000):
        o.append(spinTest()['bonusCount']) # много че возвращает но обращаемся ток к бонус каунт
    return {
        'RTP': str(sum(t)/len(t))[:5]+'%',
        'BONUS CHANCE': str(float(str(sum(o)/len(o))[:5])*100)[:5]+'%'
    }


class Balance(BaseModel):
    balance: int

@app.post('/')
def create_balance(newBalance = Balance):
    return {'successs':True}

