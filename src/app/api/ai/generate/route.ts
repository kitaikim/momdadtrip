// 여행 일지 → 블로그 초안 + SNS 캡션 생성 API
import { NextRequest, NextResponse } from 'next/server';

interface Place {
  title: string;
  address: string;
}

interface DayData {
  date: string;
  places: Place[];
  memo: string;
}

function buildDummy(tripTitle: string, days: DayData[]) {
  const allPlaces = days.flatMap(d => d.places.map(p => p.title)).filter(Boolean);
  const placeText = allPlaces.length > 0 ? allPlaces.slice(0, 3).join(', ') : '강원도 명소';
  const hasMemo = days.some(d => d.memo);

  const blog = `아이와 함께한 "${tripTitle}"이 드디어 끝났다. ${days.length}일이라는 짧은 시간이었지만, ${placeText}에서 쌓은 추억은 평생 기억에 남을 것 같다.

첫날, 아이의 눈이 얼마나 반짝였는지 모른다. 낯선 곳에 대한 설렘과 호기심이 가득 담긴 눈빛으로 이것저것 물어보는 아이를 보며, 이 여행을 계획하길 정말 잘했다는 생각이 들었다.${hasMemo ? '\n\n여행 내내 아이가 특히 좋아했던 건 자연이었다. 도시에서는 보기 힘든 광활한 자연 앞에서 아이는 한참 동안 움직이지 않았다.' : ''}

강원도는 올 때마다 새롭다. 공기부터 다르고, 풍경도 다르다. 무엇보다 아이와 함께라는 것 자체가 여행을 더 특별하게 만든다. 다음에는 더 긴 일정으로 강원도 곳곳을 누벼보고 싶다.`;

  const sns = `🏔️ ${tripTitle} ✨\n아이와 함께한 강원도 ${days.length}일, 매 순간이 선물이었어요 💝\n${placeText}에서 만든 우리만의 추억 🌿\n\n#강원도여행 #아이랑여행 #가족여행 #엄마랑아빠랑 #강원도육아여행 #아이와강원도 #가족여행스타그램`;

  return { blog, sns };
}

export async function POST(req: NextRequest) {
  try {
    const { tripTitle, startDate, endDate, days } = await req.json() as {
      tripTitle: string;
      startDate: string;
      endDate: string;
      days: DayData[];
    };

    // API 키 없으면 더미 응답
    if (!process.env.ANTHROPIC_API_KEY) {
      await new Promise(r => setTimeout(r, 1500)); // 생성 중 느낌
      return NextResponse.json(buildDummy(tripTitle, days));
    }

    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const daysSummary = days.map((d, i) => {
      const places = d.places.map(p => p.title).join(', ') || '없음';
      const memo = d.memo || '(기록 없음)';
      return `Day ${i + 1} (${d.date})\n- 방문 장소: ${places}\n- 일지: ${memo}`;
    }).join('\n\n');

    const prompt = `당신은 따뜻하고 감성적인 가족 여행 블로그 작가입니다.
아래 강원도 가족 여행 정보를 바탕으로 두 가지 콘텐츠를 한국어로 작성해주세요.

여행 제목: ${tripTitle}
여행 기간: ${startDate} ~ ${endDate}
총 ${days.length}일

--- 날짜별 기록 ---
${daysSummary}

---

아래 형식으로 정확히 응답해주세요 (JSON):

{
  "blog": "블로그 초안 (400~600자, 여행의 감동과 아이 반응 중심, 자연스러운 문체, 강원도 여행의 특별함 강조)",
  "sns": "인스타그램 캡션 (150자 이내, 이모지 포함, 해시태그 5개 이상 포함, #강원도여행 #아이랑여행 #가족여행 등)"
}`;

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const raw = message.content[0].type === 'text' ? message.content[0].text : '';
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const result = JSON.parse(cleaned);

    return NextResponse.json(result);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '생성 실패' }, { status: 500 });
  }
}
