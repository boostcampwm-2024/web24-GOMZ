const adjectives = [
  '귀찮은',
  '달콤한',
  '방방뛰는',
  '엉뚱한',
  '배고픈',
  '웃기는',
  '번뜩이는',
  '방귀뀌는',
  '복숭아같은',
  '초록빛',
  '멍때리는',
  '반짝이는',
  '비밀스러운',
  '미스터리한',
  '용감한',
  '쌩쌩한',
  '빛나는',
  '귀여운',
  '잘생긴',
  '멋있는',
];

const nouns = [
  '오랑우탄',
  '파스타',
  '드래곤',
  '토끼',
  '해커',
  '유령',
  '망고',
  '코알라',
  '마법사',
  '레몬',
  '스파게티',
  '요정',
  '불도저',
  '비둘기',
  '번개',
  '도토리',
  '왕자',
  '피카츄',
];

function getRandomElement(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 랜덤 닉네임 생성 메소드
export function generateRandomNickname(): string {
  const adjective = getRandomElement(adjectives);
  const noun = getRandomElement(nouns);
  return `${adjective} ${noun}`;
}
