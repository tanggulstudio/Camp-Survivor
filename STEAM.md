# 스팀 출시 준비 안내

게임 코드 쪽 준비는 끝나 있어요. 아래는 Steamworks 사이트에서 직접 해야 하는 일이에요.
(엔진을 바꿀 필요는 없어요. 지금 구조(HTML5 캔버스 + Electron)로 스팀 기능을 모두 연결할 수 있어요.)

## 1. 앱 등록과 App ID
1. partner.steamgames.com 에서 Steamworks 가입, Steam Direct 등록비(앱 하나당 100달러) 결제
2. 정식판 앱을 만들면 **App ID**(숫자)가 나와요
3. 앱 관리 화면에서 **체험판(Demo) 앱**을 따로 만들어요(추가 등록비 없음). 체험판도 자기 App ID를 받아요
4. 정식판 상점 주소(`https://store.steampowered.com/app/<App ID>/...`)를 Claude에게 알려 주면
   `js/rounds.js`의 `STORE_URL`(체험판의 "스팀에서 찜하기" 버튼)을 채워요

## 2. 빌드 올리기 (SteamPipe)
- GitHub Actions의 **Build Windows app** 실행 결과에서 받아요
  - 정식판: `CampSurvivor-Steam-build` 폴더 전체
  - 체험판: `CampSurvivor-Steam-demo` 폴더 전체
- Steamworks → SteamPipe → 빌드 업로드(웹 업로드 또는 steamcmd)로 각 앱의 depot에 올려요
- 실행 옵션(Launch Option): `CampSurvivor.exe` (정식판, 체험판 같음)
- 스팀 클라이언트에서 실행하면 App ID가 자동으로 전달돼서 업적·오버레이가 켜져요.
  스팀 밖에서 시험할 때는 exe 옆에 `steam_appid.txt`(App ID 숫자 한 줄)를 두면 돼요

## 3. 스팀 클라우드 (저장 동기화)
게임이 저장할 때마다 `%APPDATA%\Camp Survivor\saves\*.json`에도 파일로 남겨요.
앱 관리 → 클라우드에서:
- 바이트 할당량 10MB, 파일 수 100
- **Auto-Cloud** 루트 경로 추가: 루트 `WinAppDataRoaming`, 하위 폴더 `Camp Survivor/saves`, 패턴 `*.json`
- 체험판과 정식판은 같은 폴더를 써서, 체험판 진행이 정식판으로 이어져요

## 4. 업적
앱 관리 → 통계 및 업적 → 업적에 아래 API 이름 그대로 등록해요. 게임은 `ACH_` + 아이디(대문자)로 달성 신호를 보내요.
아이콘은 업적마다 달성/미달성 64×64 이미지 2장이 필요해요.

| API 이름 | 한국어 | English | 조건 |
|---|---|---|---|
| ACH_D3 | 첫 고비 | First Hurdle | Reach the morning of day 3 |
| ACH_D7 | 일주일 생존 | One Week Survived | Reach the morning of day 7 |
| ACH_D15 | 버티는 자 | Endurer | Reach the morning of day 15 |
| ACH_D30 | 불을 지키는 자 | Keeper of the Fire | Reach the morning of day 30 |
| ACH_D50 | 꺼지지 않는 화톳불 | Undying Bonfire | Reach the morning of day 50 |
| ACH_K100 | 사냥꾼 | Hunter | Defeat 100 monsters |
| ACH_K500 | 전사 | Warrior | Defeat 500 monsters |
| ACH_K2000 | 학살자 | Slayer | Defeat 2000 monsters |
| ACH_B_CHIEF | 검은 부적 | The Black Charm | Defeat the Goblin Chieftain |
| ACH_B_HYDRA | 늪의 주인 | Master of the Swamp | Defeat the hydra |
| ACH_B_GOLEM | 수정 파괴자 | Crystal Breaker | Defeat the Crystal Golem |
| ACH_B_FLAME | 불을 삼킨 자 | Fire Swallower | Defeat the Flame Lord |
| ACH_B_FROST | 얼음을 녹인 자 | Ice Melter | Defeat the Frost Queen |
| ACH_B_ABYSS | 심연 너머 | Beyond the Abyss | Defeat the hidden Lord of the Abyss |
| ACH_T10 | 탑 오르기 | Climbing the Tower | Clear floor 10 of the Tower of Trials |
| ACH_T25 | 구름 위로 | Above the Clouds | Clear floor 25 of the Tower of Trials |
| ACH_T50 | 정상의 주인 | Master of the Summit | Clear floor 50 of the Tower of Trials |
| ACH_PET1 | 첫 친구 | First Friend | Get your first pet |
| ACH_PETALL | 동물 박사 | Animal Expert | Collect all 6 pets |
| ACH_PET30 | 최고의 동료 | Best Companion | Raise a pet to Lv30 |
| ACH_VILL10 | 작은 마을 | Little Village | Gather 10 villagers |
| ACH_LV5 | 장인의 손 | Master Builder | Upgrade a building to Lv5 |
| ACH_PICKD | 다이아 곡괭이 | Diamond Pickaxe | Craft a diamond pickaxe |
| ACH_PICKM | 미스릴 곡괭이 | Mithril Pickaxe | Craft a mithril pickaxe |
| ACH_RELIC | 유물 수집가 | Relic Collector | Get a boss relic |
| ACH_UNIQ | 종결 장비 | Endgame Gear | Get a unique item |
| ACH_ENH10 | +10 강화 | +10 Enhancement | Enhance a piece of gear to +10 |
| ACH_BEACON4 | 봉화 지기 | Beacon Keeper | Light 4 beacons |
| ACH_BIOME6 | 세상 구경 | Wanderer | Visit all 6 new biomes |
| ACH_CHARM6 | 여섯 계절 | Six Seasons | Craft the Charm of Six Seasons |
| ACH_AWAK1 | 각성한 자 | Awakened | Defeat your first awakened boss |
| ACH_AWAK5 | 끝없는 밤의 주인 | Lord of Endless Night | Defeat 5 awakened bosses |
| ACH_D100 | 백 일의 불꽃 | Hundred-Day Flame | Reach the morning of day 100 |
| ACH_CDX25 | 수집가의 첫걸음 | First Collector | Fill 25% of the codex |
| ACH_CDX50 | 부지런한 기록가 | Diligent Recorder | Fill 50% of the codex |
| ACH_CDX75 | 숲의 백과사전 | Forest Encyclopedia | Fill 75% of the codex |
| ACH_CDX100 | 모든 것을 본 자 | Seen It All | Fill the whole codex |
| ACH_SUN8 | 긴 낮 | Long Day | Offer 8 sunstones at the Altar of the Sun |
## 5. 스팀 덱
- 컨트롤러 조작과 버튼 안내가 이미 있어요. 출시 전 "Steam Deck 호환성 검토"를 신청해요
- 앱 관리의 Steam 입력 설정에서 게임이 컨트롤러를 직접 지원한다고 표시해 두면 돼요

## 6. 친구와 함께하기 (나중 단계)
지금은 PeerJS(무료 공개 연결 서버)로 방 코드를 주고받아요. 출시 후 사람이 몰리면 공개 서버가 불안정할 수 있어서,
App ID가 나온 뒤 **스팀 로비 + 스팀 친구 초대**로 바꾸는 걸 권해요. steamworks.js에 필요한 기능이 들어 있고,
시험하려면 스팀 계정 2개(PC 2대)가 필요해요.
