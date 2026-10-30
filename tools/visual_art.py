# -*- coding: utf-8 -*-
"""Decorative fictional UI illustrations for covers and chapter dividers.
Not production screenshots or evidence of a client deliverable.
"""
from lib import R,T,LN
BG='#101a2a'
PANEL='#15243a'
PANEL2='#1a2c45'
WHITE='#f8fafc'
SOFT='#aab9cc'

def _chip(x,y,w,label,color='#aec8ef'):
    return R(x,y,w,34,fill='#223854',rx=17)+T(x+18,y+23,label,size=15,fill=color,weight=600)

def hmi_art():
    a=[R(806,153,680,499,fill=PANEL,stroke='#37506c',sw=2,rx=34),
       R(828,175,636,455,fill='#0b1525',rx=26),
       T(860,216,'HMI / CONTROL LOGIC',size=16,fill='#a2b4ca',weight=700,ls=3),
       R(1374,194,10,10,fill='#78b8ff',rx=5),
       R(1396,194,10,10,fill='#425d80',rx=5),
       R(1418,194,10,10,fill='#425d80',rx=5),
       LN(860,243,1432,243,stroke='#2e4159')]
    tiles=[(860,278,253,126,'01  DISPLAY','显示 / 常驻状态'),
           (1130,278,300,126,'02  CLIMATE','连续值与分档'),
           (860,420,253,125,'03  SHORTCUT','触发 / 反馈'),
           (1130,420,300,125,'04  PRIORITY','事件 / 让位')]
    for i,(x,y,w,h,head,sub) in enumerate(tiles):
        on=i==3
        a += [R(x,y,w,h,fill=('#193855' if on else PANEL2),
                stroke=('#62b3ff' if on else '#354c66'),rx=16),
              T(x+18,y+32,head,size=17,weight=700,
                fill=('#8dcbff' if on else '#d6e4f4'),ls=1),
              T(x+18,y+60,sub,size=16,fill=SOFT)]
        if i==0:
            a += [R(x+18,y+80,90,23,fill='#3d7bba',rx=12),
                  R(x+77,y+83,17,17,fill=WHITE,rx=8)]
        elif i==1:
            a += [LN(x+20,y+96,x+w-30,y+96,stroke='#3b607d',sw=7),
                  LN(x+20,y+96,x+172,y+96,stroke='#7abaff',sw=7),
                  R(x+164,y+86,20,20,fill='#d4eeff',rx=10)]
        elif i==2:
            a += [R(x+18,y+83,50,24,fill='#345a83',rx=8),
                  R(x+77,y+83,50,24,fill='#345a83',rx=8),
                  R(x+136,y+83,50,24,fill='#345a83',rx=8)]
        else:
            a += [R(x+18,y+84,101,8,fill='#487fab',rx=4),
                  R(x+125,y+84,48,8,fill='#85c4ff',rx=4),
                  R(x+180,y+84,83,8,fill='#284a69',rx=4)]
    a += [T(858,599,'INTERACTION SCHEMATIC  /  非项目实屏',
            size=13,fill='#8799b1',ls=1.3),
          R(768,237,83,2,fill='#3d79ba'),
          R(789,222,41,2,fill='#3d79ba')]
    return ''.join(a)

def product_art():
    a=[R(809,151,680,514,fill=PANEL,stroke='#50477d',sw=2,rx=34),
       R(832,175,634,467,fill='#121a30',rx=25),
       T(858,216,'PRODUCT / EXPERIENCE FLOW',size=16,
         fill='#b2a8e7',weight=700,ls=2),
       LN(858,243,1436,243,stroke='#393759'),
       _chip(861,267,168,'01  TASK'),
       _chip(1059,267,172,'02  DIALOGUE'),
       _chip(1261,267,160,'03  REVIEW')]
    a += [R(861,337,425,76,fill='#23304c',rx=15),
          T(887,365,'Practice scenario',size=15,fill='#b8c8df',weight=700),
          T(887,392,'A short conversation, every day.',size=16,fill=WHITE),
          R(1008,432,416,72,fill='#4d438c',rx=15),
          T(1030,460,'Your turn',size=15,fill='#d7d2ff',weight=700),
          T(1030,486,'I would suggest another route.',size=16,fill=WHITE),
          R(861,524,563,65,fill='#21364a',stroke='#3e5270',rx=14),
          R(880,545,9,9,fill='#70cfab',rx=5),
          T(900,556,'Feedback is recorded for the next review.',
            size=16,fill='#d1e4ec'),
          T(863,617,'WORKFLOW DIAGRAM  /  非真实截图',
            size=13,fill='#8795bb',ls=1.2)]
    return ''.join(a)

def divider_art(theme):
    col=theme or '#5594ef'
    a=[R(1018,239,439,359,fill='#243447',stroke='#3a5068',rx=22),
       R(1039,260,397,315,fill='#162337',rx=17)]
    if theme=='#2563eb':
        for i,y in enumerate((303,367,431)):
            a += [R(1071,y,155,43,fill='#263b57',rx=8),
                  R(1261,y,126,43,
                    fill=('#245a98' if i==1 else '#28405b'),rx=8),
                  R(1237,y+17,14,6,fill='#71aaf0',rx=3)]
        a += [R(1071,524,314,8,fill=col,rx=4),
              T(1072,553,'CONFIGURATION / RULES',
                size=12,fill='#7e9ab7',ls=2)]
    elif theme=='#0d9488':
        a += [R(1072,295,311,55,fill='#28515a',rx=12),
              R(1072,371,194,55,fill='#2b4056',rx=12),
              R(1290,371,93,55,fill='#3b5f64',rx=12),
              LN(1167,447,1167,504,stroke=col,sw=4),
              LN(1167,504,1330,504,stroke=col,sw=4),
              R(1321,495,18,18,fill='#72d6bd',rx=9),
              T(1073,545,'EVENT / RESPONSE',
                size=12,fill='#90aaa8',ls=2)]
    else:
        a += [R(1065,293,283,63,fill='#424078',rx=12),
              R(1134,375,267,62,fill='#2b4056',rx=12),
              R(1065,456,330,74,fill='#284c58',rx=12),
              R(1088,492,8,8,fill='#85dac0',rx=4),
              R(1105,492,190,7,fill='#759c9b',rx=3),
              T(1072,553,'TASK / FEEDBACK',
                size=12,fill='#a69ccc',ls=2)]
    return ''.join(a)
