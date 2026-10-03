import { v } from "convex/values";
import { mutation, query, internalMutation, MutationCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";
import {
  authFail,
  isAround,
  isPresent,
  requireCaller,
  requireHost,
  requireMember,
  storedDrawingUrl,
} from "./participants";

// ─── Trace helper ────────────────────────────────────────────────────────────

async function trace(
  ctx: any,
  gameId: Id<"truthOrDareGames">,
  action: string,
  participantId?: string,
  detail?: string,
) {
  try {
    await ctx.db.insert("todTrace", {
      gameId,
      action,
      participantId,
      detail: detail?.slice(0, 200),
      ts: Date.now(),
    });
  } catch {
    // never let tracing break gameplay
  }
}

// ─── Prompt pools (200 prompts: 100 normal + 100 spicy) ─────────────────────

type TruthOrDarePrompt = {
  id: string;
  mode: "normal" | "deep";
  truthOrDare: "truth" | "dare";
  responseType: "text" | "drawing";
  text: string;
  ja: string;
};

const truthOrDarePrompts: TruthOrDarePrompt[] = [
// NORMAL MODE — TRUTH (50)
{ id: "n_t_001", mode: "normal", truthOrDare: "truth", responseType: "text", text: "What is your favorite food?", ja: "好きな食べ物は何？" },
{ id: "n_t_002", mode: "normal", truthOrDare: "truth", responseType: "text", text: "What is your favorite animal?", ja: "好きな動物は？" },
{ id: "n_t_003", mode: "normal", truthOrDare: "truth", responseType: "text", text: "What is your favorite color?", ja: "好きな色は何？" },
{ id: "n_t_004", mode: "normal", truthOrDare: "truth", responseType: "text", text: "What is your favorite movie?", ja: "好きな映画は？" },
{ id: "n_t_005", mode: "normal", truthOrDare: "truth", responseType: "text", text: "What is your favorite game?", ja: "好きなゲームは何？" },
{ id: "n_t_006", mode: "normal", truthOrDare: "truth", responseType: "text", text: "What is your favorite song?", ja: "好きな曲は？" },
{ id: "n_t_007", mode: "normal", truthOrDare: "truth", responseType: "text", text: "What is your favorite season?", ja: "好きな季節は？" },
{ id: "n_t_008", mode: "normal", truthOrDare: "truth", responseType: "text", text: "What is your favorite drink?", ja: "好きな飲み物は何？" },
{ id: "n_t_009", mode: "normal", truthOrDare: "truth", responseType: "text", text: "What is your favorite dessert?", ja: "好きなデザートは？" },
{ id: "n_t_010", mode: "normal", truthOrDare: "truth", responseType: "text", text: "What is your favorite place?", ja: "お気に入りの場所は？" },
{ id: "n_t_011", mode: "normal", truthOrDare: "truth", responseType: "text", text: "Are you a morning person or a night person?", ja: "朝型？それとも夜型？" },
{ id: "n_t_012", mode: "normal", truthOrDare: "truth", responseType: "text", text: "Do you like cats or dogs more?", ja: "猫派？犬派？" },
{ id: "n_t_013", mode: "normal", truthOrDare: "truth", responseType: "text", text: "Do you prefer sweet or salty food?", ja: "甘いもの派？しょっぱいもの派？" },
{ id: "n_t_014", mode: "normal", truthOrDare: "truth", responseType: "text", text: "Do you like the beach or mountains more?", ja: "海と山、どっちが好き？" },
{ id: "n_t_015", mode: "normal", truthOrDare: "truth", responseType: "text", text: "Do you like summer or winter more?", ja: "夏と冬、どっちが好き？" },
{ id: "n_t_016", mode: "normal", truthOrDare: "truth", responseType: "text", text: "Do you like reading or watching movies more?", ja: "読書と映画鑑賞、どっちが好き？" },
{ id: "n_t_017", mode: "normal", truthOrDare: "truth", responseType: "text", text: "Do you prefer texting or talking?", ja: "メッセージと電話、どっちが好き？" },
{ id: "n_t_018", mode: "normal", truthOrDare: "truth", responseType: "text", text: "Do you like spicy food?", ja: "辛い食べ物は好き？" },
{ id: "n_t_019", mode: "normal", truthOrDare: "truth", responseType: "text", text: "Do you like traveling?", ja: "旅行は好き？" },
{ id: "n_t_020", mode: "normal", truthOrDare: "truth", responseType: "text", text: "Do you like surprises?", ja: "サプライズは好き？" },
{ id: "n_t_021", mode: "normal", truthOrDare: "truth", responseType: "text", text: "What is something that makes you happy?", ja: "幸せな気持ちになることって何？" },
{ id: "n_t_022", mode: "normal", truthOrDare: "truth", responseType: "text", text: "What is something that makes you laugh?", ja: "思わず笑っちゃうことって何？" },
{ id: "n_t_023", mode: "normal", truthOrDare: "truth", responseType: "text", text: "What is something you are good at?", ja: "自分が得意なことは？" },
{ id: "n_t_024", mode: "normal", truthOrDare: "truth", responseType: "text", text: "What is something you want to learn?", ja: "これから学びたいことは？" },
{ id: "n_t_025", mode: "normal", truthOrDare: "truth", responseType: "text", text: "What is your dream job?", ja: "夢の仕事は何？" },
{ id: "n_t_026", mode: "normal", truthOrDare: "truth", responseType: "text", text: "What is a place you want to visit?", ja: "行ってみたい場所は？" },
{ id: "n_t_027", mode: "normal", truthOrDare: "truth", responseType: "text", text: "What is your favorite childhood memory?", ja: "子どもの頃のいちばんの思い出は？" },
{ id: "n_t_028", mode: "normal", truthOrDare: "truth", responseType: "text", text: "What is your favorite holiday?", ja: "好きな祝日やイベントは？" },
{ id: "n_t_029", mode: "normal", truthOrDare: "truth", responseType: "text", text: "What is your favorite hobby?", ja: "いちばんの趣味は何？" },
{ id: "n_t_030", mode: "normal", truthOrDare: "truth", responseType: "text", text: "What is something you do every day?", ja: "毎日やっていることは？" },
{ id: "n_t_031", mode: "normal", truthOrDare: "truth", responseType: "text", text: "If you were an animal, what would you be?", ja: "もし動物になれるとしたら、何になる？" },
{ id: "n_t_032", mode: "normal", truthOrDare: "truth", responseType: "text", text: "If you could have a superpower, what would it be?", ja: "もし超能力が使えるなら、何がいい？" },
{ id: "n_t_033", mode: "normal", truthOrDare: "truth", responseType: "text", text: "If you could live anywhere, where would it be?", ja: "もしどこにでも住めるなら、どこがいい？" },
{ id: "n_t_034", mode: "normal", truthOrDare: "truth", responseType: "text", text: "If you were a food, what would you be?", ja: "もし自分が食べ物だったら、何だと思う？" },
{ id: "n_t_035", mode: "normal", truthOrDare: "truth", responseType: "text", text: "If you could time travel, where would you go?", ja: "もしタイムトラベルできるなら、いつの時代に行く？" },
{ id: "n_t_036", mode: "normal", truthOrDare: "truth", responseType: "text", text: "If you could meet anyone, who would it be?", ja: "もし誰にでも会えるなら、誰に会いたい？" },
{ id: "n_t_037", mode: "normal", truthOrDare: "truth", responseType: "text", text: "If you had a robot, what would it do?", ja: "もしロボットを持ってたら、何をさせたい？" },
{ id: "n_t_038", mode: "normal", truthOrDare: "truth", responseType: "text", text: "If you could fly or be invisible, which would you choose?", ja: "空を飛べるのと透明人間、どっちがいい？" },
{ id: "n_t_039", mode: "normal", truthOrDare: "truth", responseType: "text", text: "If you were a character in a movie, who would you be?", ja: "もし映画のキャラになれるなら、誰になりたい？" },
{ id: "n_t_040", mode: "normal", truthOrDare: "truth", responseType: "text", text: "If you had a pet dragon, what would you name it?", ja: "もしドラゴンを飼えるなら、名前は何にする？" },
{ id: "n_t_041", mode: "normal", truthOrDare: "truth", responseType: "text", text: "Who in this room is the funniest?", ja: "このルームで一番おもしろい人は誰？" },
{ id: "n_t_042", mode: "normal", truthOrDare: "truth", responseType: "text", text: "Who in this room would survive on an island?", ja: "このルームで無人島で生き残れそうな人は？" },
{ id: "n_t_043", mode: "normal", truthOrDare: "truth", responseType: "text", text: "Who in this room would be a good leader?", ja: "このルームでリーダーに向いてる人は？" },
{ id: "n_t_044", mode: "normal", truthOrDare: "truth", responseType: "text", text: "Who in this room would make the best chef?", ja: "このルームで一番料理が上手そうな人は？" },
{ id: "n_t_045", mode: "normal", truthOrDare: "truth", responseType: "text", text: "Who in this room would be the best teacher?", ja: "このルームで一番いい先生になれそうな人は？" },
{ id: "n_t_046", mode: "normal", truthOrDare: "truth", responseType: "text", text: "What is your favorite word in your language?", ja: "自分の言語で好きな言葉は？" },
{ id: "n_t_047", mode: "normal", truthOrDare: "truth", responseType: "text", text: "Say your favorite food in another language.", ja: "好きな食べ物を他の言語で言ってみて。" },
{ id: "n_t_048", mode: "normal", truthOrDare: "truth", responseType: "text", text: "What is a word you want to learn today?", ja: "今日覚えたい言葉は何？" },
{ id: "n_t_049", mode: "normal", truthOrDare: "truth", responseType: "text", text: "What is a phrase you use often?", ja: "よく使うフレーズは？" },
{ id: "n_t_050", mode: "normal", truthOrDare: "truth", responseType: "text", text: "Teach us one word in your language.", ja: "自分の言語の言葉をひとつ教えて。" },
// NORMAL MODE — DARE (50)
{ id: "n_d_001", mode: "normal", truthOrDare: "dare", responseType: "text", text: "Say hello in another language.", ja: "他の言語で「こんにちは」と言ってみて。" },
{ id: "n_d_002", mode: "normal", truthOrDare: "dare", responseType: "text", text: "Write a funny sentence.", ja: "おもしろい文を書いてみて。" },
{ id: "n_d_003", mode: "normal", truthOrDare: "dare", responseType: "text", text: "Describe your day in 3 words.", ja: "今日の一日を3つの言葉で表して。" },
{ id: "n_d_004", mode: "normal", truthOrDare: "dare", responseType: "text", text: "Write a sentence using emojis only.", ja: "絵文字だけで文を作って。" },
{ id: "n_d_005", mode: "normal", truthOrDare: "dare", responseType: "text", text: "Say something nice to the group.", ja: "みんなに何かいいことを言ってみて。" },
{ id: "n_d_006", mode: "normal", truthOrDare: "dare", responseType: "text", text: "Make a sentence about a dragon and pizza.", ja: "ドラゴンとピザについての文を作って。" },
{ id: "n_d_007", mode: "normal", truthOrDare: "dare", responseType: "text", text: "Write your name backwards.", ja: "自分の名前を逆から書いてみて。" },
{ id: "n_d_008", mode: "normal", truthOrDare: "dare", responseType: "text", text: "Describe your favorite food without naming it.", ja: "好きな食べ物を名前を言わずに説明してみて。" },
{ id: "n_d_009", mode: "normal", truthOrDare: "dare", responseType: "text", text: "Write a silly poem in one or two lines.", ja: "1〜2行のおもしろい詩を書いて。" },
{ id: "n_d_010", mode: "normal", truthOrDare: "dare", responseType: "text", text: "Say something you would say to a cat.", ja: "猫に話しかけるように何か言ってみて。" },
{ id: "n_d_011", mode: "normal", truthOrDare: "dare", responseType: "text", text: "Describe your mood in one word.", ja: "今の気分をひとことで表して。" },
{ id: "n_d_012", mode: "normal", truthOrDare: "dare", responseType: "text", text: "Write a sentence that makes no sense.", ja: "意味のわからない文を書いてみて。" },
{ id: "n_d_013", mode: "normal", truthOrDare: "dare", responseType: "text", text: "Say 'I like pizza' in another language.", ja: "「ピザが好き」を他の言語で言ってみて。" },
{ id: "n_d_014", mode: "normal", truthOrDare: "dare", responseType: "text", text: "Write a question for the next player.", ja: "次のプレイヤーへの質問を書いて。" },
{ id: "n_d_015", mode: "normal", truthOrDare: "dare", responseType: "text", text: "Write a sentence using only 5 words.", ja: "5つの単語だけで文を作って。" },
{ id: "n_d_016", mode: "normal", truthOrDare: "dare", responseType: "drawing", text: "Draw something red.", ja: "赤いものを描いて。" },
{ id: "n_d_017", mode: "normal", truthOrDare: "dare", responseType: "drawing", text: "Draw something blue.", ja: "青いものを描いて。" },
{ id: "n_d_018", mode: "normal", truthOrDare: "dare", responseType: "drawing", text: "Draw something soft.", ja: "やわらかいものを描いて。" },
{ id: "n_d_019", mode: "normal", truthOrDare: "dare", responseType: "drawing", text: "Draw something that makes you happy.", ja: "幸せな気持ちになるものを描いて。" },
{ id: "n_d_020", mode: "normal", truthOrDare: "dare", responseType: "drawing", text: "Draw your favorite thing nearby.", ja: "近くにあるお気に入りのものを描いて。" },
{ id: "n_d_021", mode: "normal", truthOrDare: "dare", responseType: "drawing", text: "Draw something round.", ja: "丸いものを描いて。" },
{ id: "n_d_022", mode: "normal", truthOrDare: "dare", responseType: "drawing", text: "Draw something small.", ja: "小さいものを描いて。" },
{ id: "n_d_023", mode: "normal", truthOrDare: "dare", responseType: "drawing", text: "Draw something in your room.", ja: "部屋にあるものをひとつ描いて。" },
{ id: "n_d_024", mode: "normal", truthOrDare: "dare", responseType: "drawing", text: "Draw a self-portrait.", ja: "自画像を描いて。" },
{ id: "n_d_025", mode: "normal", truthOrDare: "dare", responseType: "drawing", text: "Draw something you use every day.", ja: "毎日使っているものを描いて。" },
{ id: "n_d_026", mode: "normal", truthOrDare: "dare", responseType: "drawing", text: "Draw something that makes you smile.", ja: "笑顔になれるものを描いて。" },
{ id: "n_d_027", mode: "normal", truthOrDare: "dare", responseType: "drawing", text: "Draw something interesting.", ja: "おもしろいものを描いて。" },
{ id: "n_d_028", mode: "normal", truthOrDare: "dare", responseType: "drawing", text: "Draw something shiny.", ja: "キラキラしたものを描いて。" },
{ id: "n_d_029", mode: "normal", truthOrDare: "dare", responseType: "drawing", text: "Draw something green.", ja: "緑色のものを描いて。" },
{ id: "n_d_030", mode: "normal", truthOrDare: "dare", responseType: "drawing", text: "Draw something you like.", ja: "好きなものを描いて。" },
{ id: "n_d_031", mode: "normal", truthOrDare: "dare", responseType: "drawing", text: "Draw a cat.", ja: "猫を描いて。" },
{ id: "n_d_032", mode: "normal", truthOrDare: "dare", responseType: "drawing", text: "Draw your mood.", ja: "今の気分を絵で描いて。" },
{ id: "n_d_033", mode: "normal", truthOrDare: "dare", responseType: "drawing", text: "Draw your favorite food.", ja: "好きな食べ物を描いて。" },
{ id: "n_d_034", mode: "normal", truthOrDare: "dare", responseType: "drawing", text: "Draw a monster.", ja: "モンスターを描いて。" },
{ id: "n_d_035", mode: "normal", truthOrDare: "dare", responseType: "drawing", text: "Draw a house.", ja: "家を描いて。" },
{ id: "n_d_036", mode: "normal", truthOrDare: "dare", responseType: "drawing", text: "Draw something the room can guess.", ja: "みんなが当てられるものを描いて。" },
{ id: "n_d_037", mode: "normal", truthOrDare: "dare", responseType: "drawing", text: "Draw a funny face.", ja: "おもしろい顔を描いて。" },
{ id: "n_d_038", mode: "normal", truthOrDare: "dare", responseType: "drawing", text: "Draw an animal.", ja: "動物を描いて。" },
{ id: "n_d_039", mode: "normal", truthOrDare: "dare", responseType: "drawing", text: "Draw a robot.", ja: "ロボットを描いて。" },
{ id: "n_d_040", mode: "normal", truthOrDare: "dare", responseType: "drawing", text: "Draw something from your imagination.", ja: "想像したものを自由に描いて。" },
{ id: "n_d_041", mode: "normal", truthOrDare: "dare", responseType: "text", text: "Describe your day using only emojis.", ja: "今日の一日を絵文字だけで表して。" },
{ id: "n_d_042", mode: "normal", truthOrDare: "dare", responseType: "text", text: "Send 5 emojis that represent you.", ja: "自分を表す絵文字を5つ送って。" },
{ id: "n_d_043", mode: "normal", truthOrDare: "dare", responseType: "text", text: "Describe your favorite food using emojis.", ja: "好きな食べ物を絵文字で表して。" },
{ id: "n_d_044", mode: "normal", truthOrDare: "dare", responseType: "text", text: "Describe your mood using 3 emojis.", ja: "今の気分を絵文字3つで表して。" },
{ id: "n_d_045", mode: "normal", truthOrDare: "dare", responseType: "text", text: "Write a sentence mixing two languages.", ja: "2つの言語を混ぜて文を書いて。" },
{ id: "n_d_046", mode: "normal", truthOrDare: "dare", responseType: "text", text: "Say hello in 3 different languages.", ja: "3つの言語で「こんにちは」と言って。" },
{ id: "n_d_047", mode: "normal", truthOrDare: "dare", responseType: "text", text: "Send emojis for your favorite activity.", ja: "好きなアクティビティを絵文字で表して。" },
{ id: "n_d_048", mode: "normal", truthOrDare: "dare", responseType: "text", text: "Describe a movie using emojis.", ja: "映画を絵文字で表してみて。" },
{ id: "n_d_049", mode: "normal", truthOrDare: "dare", responseType: "text", text: "Send emojis for your favorite place.", ja: "好きな場所を絵文字で表して。" },
{ id: "n_d_050", mode: "normal", truthOrDare: "dare", responseType: "text", text: "Describe your personality in emojis.", ja: "自分の性格を絵文字で表して。" },
// DEEP MODE — TRUTH (50)
{ id: "d_t_001", mode: "deep", truthOrDare: "truth", responseType: "text", text: "What's something small that made you happy today?", ja: "今日、ちょっと嬉しかったことは？" },
{ id: "d_t_002", mode: "deep", truthOrDare: "truth", responseType: "text", text: "What kind of day feels perfect to you?", ja: "あなたにとって最高の一日ってどんな日？" },
{ id: "d_t_003", mode: "deep", truthOrDare: "truth", responseType: "text", text: "What's something you secretly enjoy more than you admit?", ja: "実は思ってる以上にハマっていることは？" },
{ id: "d_t_004", mode: "deep", truthOrDare: "truth", responseType: "text", text: "What's a habit you wish you could change?", ja: "変えたいなと思っている習慣は？" },
{ id: "d_t_005", mode: "deep", truthOrDare: "truth", responseType: "text", text: "What's something people assume about you that isn't true?", ja: "みんなに勘違いされがちなことは？" },
{ id: "d_t_006", mode: "deep", truthOrDare: "truth", responseType: "text", text: "What's something you're better at than most people think?", ja: "みんなが思っているより実は得意なことは？" },
{ id: "d_t_007", mode: "deep", truthOrDare: "truth", responseType: "text", text: "What's a random thing that always makes you smile?", ja: "ふとした時にいつも笑顔になれることは？" },
{ id: "d_t_008", mode: "deep", truthOrDare: "truth", responseType: "text", text: "What's something you wish you had more time for?", ja: "もっと時間があったらやりたいことは？" },
{ id: "d_t_009", mode: "deep", truthOrDare: "truth", responseType: "text", text: "What's something you do when no one is watching?", ja: "誰も見てない時についやっちゃうことは？" },
{ id: "d_t_010", mode: "deep", truthOrDare: "truth", responseType: "text", text: "What kind of person do you naturally get along with?", ja: "自然と仲良くなれるのはどんなタイプの人？" },
{ id: "d_t_011", mode: "deep", truthOrDare: "truth", responseType: "text", text: "What's something that makes you feel confident?", ja: "自信が持てることって何？" },
{ id: "d_t_012", mode: "deep", truthOrDare: "truth", responseType: "text", text: "What's something that instantly ruins your mood?", ja: "一瞬でテンションが下がることは？" },
{ id: "d_t_013", mode: "deep", truthOrDare: "truth", responseType: "text", text: "What's a small thing you care about more than others do?", ja: "他の人より自分がこだわっている小さなことは？" },
{ id: "d_t_014", mode: "deep", truthOrDare: "truth", responseType: "text", text: "What's something you pretend not to care about?", ja: "気にしてないふりをしているけど、実は気になっていることは？" },
{ id: "d_t_015", mode: "deep", truthOrDare: "truth", responseType: "text", text: "What's something that makes you feel understood?", ja: "「わかってもらえた」と感じるのはどんな時？" },
{ id: "d_t_016", mode: "deep", truthOrDare: "truth", responseType: "text", text: "What's something people misunderstand about you?", ja: "自分について誤解されやすいことは？" },
{ id: "d_t_017", mode: "deep", truthOrDare: "truth", responseType: "text", text: "What's something you overthink too much?", ja: "つい考えすぎてしまうことは？" },
{ id: "d_t_018", mode: "deep", truthOrDare: "truth", responseType: "text", text: "What's something you wish people noticed more about you?", ja: "もっと気づいてほしい自分の一面は？" },
{ id: "d_t_019", mode: "deep", truthOrDare: "truth", responseType: "text", text: "What's something you've done just to fit in?", ja: "周りに合わせるためにやったことは？" },
{ id: "d_t_020", mode: "deep", truthOrDare: "truth", responseType: "text", text: "What's something you regret saying?", ja: "言わなきゃよかったと思ったことは？" },
{ id: "d_t_021", mode: "deep", truthOrDare: "truth", responseType: "text", text: "What's something you wish you handled differently?", ja: "もう少しうまく対処できたらよかったと思うことは？" },
{ id: "d_t_022", mode: "deep", truthOrDare: "truth", responseType: "text", text: "What's something that still bothers you sometimes?", ja: "今でもたまに気になってしまうことは？" },
{ id: "d_t_023", mode: "deep", truthOrDare: "truth", responseType: "text", text: "What's something you've changed your mind about recently?", ja: "最近、考えが変わったことは？" },
{ id: "d_t_024", mode: "deep", truthOrDare: "truth", responseType: "text", text: "What's something you wish you were better at expressing?", ja: "もっと上手に伝えられたらいいなと思うことは？" },
{ id: "d_t_025", mode: "deep", truthOrDare: "truth", responseType: "text", text: "What's something you avoid talking about?", ja: "あまり話したくない話題は？" },
{ id: "d_t_026", mode: "deep", truthOrDare: "truth", responseType: "text", text: "What's something you wish you could say more honestly?", ja: "もっと素直に言えたらいいなと思うことは？" },
{ id: "d_t_027", mode: "deep", truthOrDare: "truth", responseType: "text", text: "What's something you've done that surprised even you?", ja: "自分でもびっくりするようなことをしたことは？" },
{ id: "d_t_028", mode: "deep", truthOrDare: "truth", responseType: "text", text: "What's something you've done just for attention?", ja: "注目されたくてやったことは？" },
{ id: "d_t_029", mode: "deep", truthOrDare: "truth", responseType: "text", text: "What's something you feel slightly embarrassed about?", ja: "ちょっと恥ずかしいなと思っていることは？" },
{ id: "d_t_030", mode: "deep", truthOrDare: "truth", responseType: "text", text: "What's something you've kept to yourself for a long time?", ja: "ずっと自分の中にしまっていたことは？" },
{ id: "d_t_031", mode: "deep", truthOrDare: "truth", responseType: "text", text: "What makes you feel emotionally safe with someone?", ja: "誰かと一緒にいて「安心できる」と感じるのはどんな時？" },
{ id: "d_t_032", mode: "deep", truthOrDare: "truth", responseType: "text", text: "What kind of honesty do you appreciate most?", ja: "どんな正直さがいちばんありがたい？" },
{ id: "d_t_033", mode: "deep", truthOrDare: "truth", responseType: "text", text: "What's something that makes you feel close to someone?", ja: "誰かと「距離が縮まった」と感じるのはどんな時？" },
{ id: "d_t_034", mode: "deep", truthOrDare: "truth", responseType: "text", text: "What's something you're afraid people will misunderstand about you?", ja: "誤解されるのが怖い自分の一面は？" },
{ id: "d_t_035", mode: "deep", truthOrDare: "truth", responseType: "text", text: "What's something you don't say out loud often but feel strongly?", ja: "口には出さないけど、強く感じていることは？" },
{ id: "d_t_036", mode: "deep", truthOrDare: "truth", responseType: "text", text: "What's something you're still figuring out about yourself?", ja: "自分自身について、まだわかっていないことは？" },
{ id: "d_t_037", mode: "deep", truthOrDare: "truth", responseType: "text", text: "What kind of support do you need when things are hard?", ja: "つらい時、どんなサポートがあると助かる？" },
{ id: "d_t_038", mode: "deep", truthOrDare: "truth", responseType: "text", text: "What's something you wish someone would ask you more often?", ja: "もっと聞いてほしいなと思う質問は？" },
{ id: "d_t_039", mode: "deep", truthOrDare: "truth", responseType: "text", text: "What's something you're proud of but rarely talk about?", ja: "誇りに思っているけど、あまり話さないことは？" },
{ id: "d_t_040", mode: "deep", truthOrDare: "truth", responseType: "text", text: "What's something that made you feel really seen by someone?", ja: "誰かに「ちゃんと見てもらえた」と感じた瞬間は？" },
{ id: "d_t_041", mode: "deep", truthOrDare: "truth", responseType: "text", text: "What's something you're still learning to accept about yourself?", ja: "自分について、まだ受け入れようとしていることは？" },
{ id: "d_t_042", mode: "deep", truthOrDare: "truth", responseType: "text", text: "What's something that scares you a little about the future?", ja: "将来のことでちょっと不安なことは？" },
{ id: "d_t_043", mode: "deep", truthOrDare: "truth", responseType: "text", text: "What's something you wish you could tell your younger self?", ja: "昔の自分に伝えたいことは？" },
{ id: "d_t_044", mode: "deep", truthOrDare: "truth", responseType: "text", text: "What's something you wish someone understood about you earlier?", ja: "もっと早くわかってほしかった自分のことは？" },
{ id: "d_t_045", mode: "deep", truthOrDare: "truth", responseType: "text", text: "What's something that takes courage for you to say?", ja: "言うのに勇気がいることは？" },
{ id: "d_t_046", mode: "deep", truthOrDare: "truth", responseType: "text", text: "What does trust mean to you?", ja: "あなたにとって「信頼」ってどういうこと？" },
{ id: "d_t_047", mode: "deep", truthOrDare: "truth", responseType: "text", text: "What's something you've learned about relationships the hard way?", ja: "人間関係で苦い経験から学んだことは？" },
{ id: "d_t_048", mode: "deep", truthOrDare: "truth", responseType: "text", text: "What's something you're still healing from (lightly)?", ja: "まだちょっと引きずっていることは？" },
{ id: "d_t_049", mode: "deep", truthOrDare: "truth", responseType: "text", text: "What does feeling close to someone mean to you?", ja: "あなたにとって「誰かと親しい」って、どういう感覚？" },
{ id: "d_t_050", mode: "deep", truthOrDare: "truth", responseType: "text", text: "After this conversation, what's something you appreciate about the group?", ja: "この会話を通して、このグループのいいなと思ったところは？" },
// DEEP MODE — DARE (40)
{ id: "d_d_001", mode: "deep", truthOrDare: "dare", responseType: "text", text: "Give a genuine compliment to someone in the room.", ja: "ルームの誰かに、心からの褒め言葉を贈って。" },
{ id: "d_d_002", mode: "deep", truthOrDare: "dare", responseType: "text", text: "Say something kind about yourself.", ja: "自分のいいところをひとつ言ってみて。" },
{ id: "d_d_003", mode: "deep", truthOrDare: "dare", responseType: "text", text: "Share something small that made you smile recently.", ja: "最近ちょっと嬉しかったことを教えて。" },
{ id: "d_d_004", mode: "deep", truthOrDare: "dare", responseType: "text", text: "Say thank you to someone in the room.", ja: "ルームの誰かに「ありがとう」を伝えて。" },
{ id: "d_d_005", mode: "deep", truthOrDare: "dare", responseType: "text", text: "Describe your mood using only emojis.", ja: "今の気分を絵文字だけで表して。" },
{ id: "d_d_006", mode: "deep", truthOrDare: "dare", responseType: "text", text: "Say something positive about today.", ja: "今日のよかったことをひとつ言って。" },
{ id: "d_d_007", mode: "deep", truthOrDare: "dare", responseType: "text", text: "Share something you're looking forward to.", ja: "楽しみにしていることを教えて。" },
{ id: "d_d_008", mode: "deep", truthOrDare: "dare", responseType: "text", text: "Describe yourself in 3 words.", ja: "自分を3つの言葉で表して。" },
{ id: "d_d_009", mode: "deep", truthOrDare: "dare", responseType: "text", text: "Say one thing you appreciate about your life.", ja: "自分の人生で感謝していることをひとつ言って。" },
{ id: "d_d_010", mode: "deep", truthOrDare: "dare", responseType: "text", text: "Describe your ideal day in one sentence.", ja: "理想の一日を一文で表して。" },
{ id: "d_d_011", mode: "deep", truthOrDare: "dare", responseType: "text", text: "Compliment someone specifically, not generically.", ja: "誰かを、ありきたりじゃなく具体的に褒めてみて。" },
{ id: "d_d_012", mode: "deep", truthOrDare: "dare", responseType: "text", text: "Share a small insecurity.", ja: "ちょっとした不安や自信のないことを教えて。" },
{ id: "d_d_013", mode: "deep", truthOrDare: "dare", responseType: "text", text: "Say something you admire about someone here.", ja: "ここにいる誰かの尊敬するところを言って。" },
{ id: "d_d_014", mode: "deep", truthOrDare: "dare", responseType: "text", text: "Share something you wish you were better at.", ja: "もっと上手になりたいことを教えて。" },
{ id: "d_d_015", mode: "deep", truthOrDare: "dare", responseType: "text", text: "Say something honest about how you feel right now.", ja: "今の気持ちを正直に言ってみて。" },
{ id: "d_d_016", mode: "deep", truthOrDare: "dare", responseType: "text", text: "Share a moment that made you feel proud.", ja: "誇らしく感じた瞬間を教えて。" },
{ id: "d_d_017", mode: "deep", truthOrDare: "dare", responseType: "text", text: "Say something you've been overthinking.", ja: "最近考えすぎていることを言ってみて。" },
{ id: "d_d_018", mode: "deep", truthOrDare: "dare", responseType: "text", text: "Share something you've learned recently.", ja: "最近学んだことを教えて。" },
{ id: "d_d_019", mode: "deep", truthOrDare: "dare", responseType: "text", text: "Say something you usually keep to yourself.", ja: "普段は言わないことをひとつ言ってみて。" },
{ id: "d_d_020", mode: "deep", truthOrDare: "dare", responseType: "text", text: "Share something meaningful to you.", ja: "自分にとって大切なことを教えて。" },
{ id: "d_d_021", mode: "deep", truthOrDare: "dare", responseType: "text", text: "Describe someone here in a positive way.", ja: "ここにいる誰かのいいところを説明して。" },
{ id: "d_d_022", mode: "deep", truthOrDare: "dare", responseType: "text", text: "Say something you appreciate about this conversation.", ja: "この会話でよかったなと思うことを言って。" },
{ id: "d_d_023", mode: "deep", truthOrDare: "dare", responseType: "text", text: "Share something that made you feel awkward recently.", ja: "最近ちょっと気まずかったことを教えて。" },
{ id: "d_d_024", mode: "deep", truthOrDare: "dare", responseType: "text", text: "Say something you don't usually admit.", ja: "普段はなかなか認めないことを言ってみて。" },
{ id: "d_d_025", mode: "deep", truthOrDare: "dare", responseType: "text", text: "Share something you want to improve.", ja: "もっと良くしたいと思っていることを教えて。" },
{ id: "d_d_026", mode: "deep", truthOrDare: "dare", responseType: "text", text: "Tell someone in the room what you appreciate about them.", ja: "ルームの誰かに、その人のいいところを伝えて。" },
{ id: "d_d_027", mode: "deep", truthOrDare: "dare", responseType: "text", text: "Share something you've been thinking about deeply.", ja: "最近じっくり考えていることを教えて。" },
{ id: "d_d_028", mode: "deep", truthOrDare: "dare", responseType: "text", text: "Say something you wish people understood about you.", ja: "みんなにわかってほしい自分のことを言って。" },
{ id: "d_d_029", mode: "deep", truthOrDare: "dare", responseType: "text", text: "Share something you're working on emotionally.", ja: "今、気持ちの面で向き合っていることを教えて。" },
{ id: "d_d_030", mode: "deep", truthOrDare: "dare", responseType: "text", text: "Say something you're proud of but don't say often.", ja: "誇りに思っているけど普段は言わないことを言ってみて。" },
{ id: "d_d_031", mode: "deep", truthOrDare: "dare", responseType: "text", text: "Share a moment that changed how you see things.", ja: "ものの見方が変わった瞬間を教えて。" },
{ id: "d_d_032", mode: "deep", truthOrDare: "dare", responseType: "text", text: "Say something that feels a little hard to say.", ja: "ちょっと言いにくいことを言ってみて。" },
{ id: "d_d_033", mode: "deep", truthOrDare: "dare", responseType: "text", text: "Share something you've grown from.", ja: "自分が成長できた経験を教えて。" },
{ id: "d_d_034", mode: "deep", truthOrDare: "dare", responseType: "text", text: "Say something you're grateful for right now.", ja: "今、感謝していることを言って。" },
{ id: "d_d_035", mode: "deep", truthOrDare: "dare", responseType: "text", text: "Share something that made you feel connected to someone.", ja: "誰かとつながりを感じた瞬間を教えて。" },
{ id: "d_d_036", mode: "deep", truthOrDare: "dare", responseType: "text", text: "Say something kind about yourself out loud.", ja: "自分のいいところを声に出して言ってみて。" },
{ id: "d_d_037", mode: "deep", truthOrDare: "dare", responseType: "text", text: "Share something you're still figuring out.", ja: "まだ答えが出ていないことを教えて。" },
{ id: "d_d_038", mode: "deep", truthOrDare: "dare", responseType: "text", text: "Tell the group what you value in relationships.", ja: "人間関係で大切にしていることをみんなに伝えて。" },
{ id: "d_d_039", mode: "deep", truthOrDare: "dare", responseType: "text", text: "Share something that makes you feel safe.", ja: "安心できることを教えて。" },
{ id: "d_d_040", mode: "deep", truthOrDare: "dare", responseType: "text", text: "Say something you're curious about.", ja: "今気になっていることを言ってみて。" },
];

function pickRandomPrompt(choice: "truth" | "dare", promptMode: "normal" | "deep", usedIds: string[]): TruthOrDarePrompt {
  const pool = truthOrDarePrompts.filter((p) => p.truthOrDare === choice && p.mode === promptMode);
  const available = pool.filter((p) => !usedIds.includes(p.id));
  const source = available.length > 0 ? available : pool;
  return source[Math.floor(Math.random() * source.length)];
}

// ─── Turn helpers ───────────────────────────────────────────────────────────

type Game = Doc<"truthOrDareGames">;
type Turn = Doc<"truthOrDareTurns">;

/** How often the server looks at whoever holds the open turn */
const ABSENCE_CHECK_MS = 15_000;
/** Looks in a row that must find the player away, so a glance at another tab or a page reload is forgiven */
const ABSENCE_MISSES_TO_SKIP = 2;

function isOpen(turn: Turn | null | undefined): turn is Turn {
  return turn?.status === "waiting_for_choice" || turn?.status === "waiting_for_response";
}

/** A seat is dealt again by a skip and every time rotation comes round, so the newest turn at the seat is the live one */
async function currentTurnOf(ctx: MutationCtx, game: Game): Promise<Turn | null> {
  return await ctx.db
    .query("truthOrDareTurns")
    .withIndex("by_gameId", (q) => q.eq("gameId", game._id))
    .filter((q) => q.eq(q.field("turnIndex"), game.currentTurnIndex))
    .order("desc")
    .first();
}

/**
 * The only place a turn is dealt, so each turn has exactly one absence check chain.
 * `misses` is 1 when the player is already away as the turn is dealt, which counts as the first look.
 */
async function openTurn(
  ctx: MutationCtx,
  gameId: Id<"truthOrDareGames">,
  turnIndex: number,
  participantId: Id<"participants">,
  misses: number,
): Promise<void> {
  const turnId = await ctx.db.insert("truthOrDareTurns", {
    gameId,
    turnIndex,
    participantId,
    status: "waiting_for_choice",
    createdAt: Date.now(),
  });
  await ctx.scheduler.runAfter(ABSENCE_CHECK_MS, internal.truthOrDare.internalAbsenceCheck, { turnId, misses });
}

/**
 * Deals the next seat whose participant still exists. Only a kick empties a seat: someone who is
 * merely away keeps theirs, and the absence check moves past them when their turn comes.
 */
async function advanceToNextSeat(ctx: MutationCtx, game: Game, endedBy: Id<"participants">): Promise<void> {
  const seats = game.playerOrder.length;
  // The walk starts at the next seat and ends on the current one. Two players found means the
  // game can go on, so it stops there instead of reading the whole room.
  const found: { index: number; player: Doc<"participants"> }[] = [];
  for (let step = 1; step <= seats && found.length < 2; step++) {
    const index = (game.currentTurnIndex + step) % seats;
    const player = await ctx.db.get(game.playerOrder[index]);
    if (player) found.push({ index, player });
  }
  if (found.length < 2) {
    await finishGame(ctx, game, endedBy);
    return;
  }
  const next = found[0];
  await ctx.db.patch(game._id, {
    currentTurnIndex: next.index,
    currentTurnParticipantId: next.player._id,
  });
  await openTurn(ctx, game._id, next.index, next.player._id, isPresent(next.player, Date.now()) ? 0 : 1);
}

/** Shared by the host's skip and the automatic one so the two cannot drift apart */
async function skipOpenTurn(ctx: MutationCtx, game: Game, turn: Turn, endedBy: Id<"participants">): Promise<void> {
  await ctx.db.patch(turn._id, {
    status: "skipped",
    completedAt: Date.now(),
  });
  await advanceToNextSeat(ctx, game, endedBy);
}

/** Must stay equal to the `completedTurns` that getActiveTruthOrDare returns: clients compare the two */
async function countCompletedTurns(ctx: MutationCtx, gameId: Id<"truthOrDareGames">): Promise<number> {
  const completed = await ctx.db
    .query("truthOrDareTurns")
    .withIndex("by_gameId_status", (q) => q.eq("gameId", gameId).eq("status", "completed"))
    .collect();
  return completed.length;
}

/** Records that the host continued past the round break at this count. Returns whether anything changed. */
async function ackRoundBreak(ctx: MutationCtx, game: Game, completedTurns: number): Promise<boolean> {
  if (completedTurns <= 0 || completedTurns % 10 !== 0) return false;
  if (game.roundBreakAckedTurns === completedTurns) return false;
  await ctx.db.patch(game._id, { roundBreakAckedTurns: completedTurns });
  return true;
}

// ─── Mutations ──────────────────────────────────────────────────────────────

export const createGame = mutation({
  args: {
    roomId: v.id("rooms"),
    hostParticipantId: v.id("participants"),
    promptMode: v.optional(v.union(v.literal("normal"), v.literal("deep"), v.literal("spicy"))),
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) throw new Error("Room not found");
    if (room.status === "closed") throw new Error("Room is closed");
    await requireMember(ctx, args.roomId, args.hostParticipantId, args.token, "truthOrDare.createGame");

    // A double tap or a client retry must not start a second game alongside the first
    const activeGame = await ctx.db
      .query("truthOrDareGames")
      .withIndex("by_roomId_status", (q) => q.eq("roomId", args.roomId).eq("status", "active"))
      .first();
    if (activeGame) return activeGame._id;

    const now = Date.now();

    // Deal whoever has been here lately, plus the person starting the game. There is no way to join
    // later, so a phone that just dimmed still gets a seat; the absence check moves past its turn.
    const participants = await ctx.db
      .query("participants")
      .withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
      .collect();
    const isStarter = (p: Doc<"participants">) => p._id === args.hostParticipantId;
    let players = participants.filter((p) => isAround(p, now) || isStarter(p));
    // The host app enables Start on two online people and shows nothing when this throws, so a
    // guest who glanced away must not make Start do nothing. The absence check moves past them.
    if (players.length < 2) players = participants.filter((p) => (p.online && !p.departed) || isStarter(p));
    if (players.length < 2) throw new Error("Need at least 2 players");

    // Shuffle player order
    const playerIds = players.map((p) => p._id);
    for (let i = playerIds.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [playerIds[i], playerIds[j]] = [playerIds[j], playerIds[i]];
    }

    // Post system message (only if no existing truth_or_dare system message in room)
    const existingMessages = await ctx.db
      .query("messages")
      .withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
      .collect();
    const hasExistingStart = existingMessages.some(
      (m) => m.kind === "system" && m.text === "game:Truth or Dare"
    );
    if (!hasExistingStart) {
      await ctx.db.insert("messages", {
        roomId: args.roomId,
        senderId: args.hostParticipantId,
        kind: "system",
        status: "processed",
        text: "game:Truth or Dare",
        createdAt: now,
      });
    }

    // Create game
    const gameId = await ctx.db.insert("truthOrDareGames", {
      roomId: args.roomId,
      status: "active",
      hostParticipantId: args.hostParticipantId,
      promptMode: args.promptMode ?? "normal",
      playerOrder: playerIds,
      currentTurnIndex: 0,
      currentTurnParticipantId: playerIds[0],
      createdAt: now,
    });

    // Create first turn
    const first = players.find((p) => p._id === playerIds[0])!;
    await openTurn(ctx, gameId, 0, first._id, isPresent(first, now) ? 0 : 1);

    return gameId;
  },
});

export const submitChoice = mutation({
  args: {
    gameId: v.id("truthOrDareGames"),
    participantId: v.id("participants"),
    choice: v.union(v.literal("truth"), v.literal("dare")),
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");
    if (game.status !== "active") throw new Error("Game is not active");
    await requireCaller(ctx, args.participantId, args.token, "truthOrDare.submitChoice");
    if (game.currentTurnParticipantId !== args.participantId) {
      throw new Error("Not your turn");
    }

    // Find current turn
    const turns = await ctx.db
      .query("truthOrDareTurns")
      .withIndex("by_gameId", (q) => q.eq("gameId", args.gameId))
      .collect();
    const currentTurn = turns.find(
      (t) => t.turnIndex === game.currentTurnIndex && t.status === "waiting_for_choice"
    );
    if (!currentTurn) {
      await trace(ctx, args.gameId, "submitChoice:duplicate", args.participantId.toString(), args.choice);
      return;
    }

    await trace(ctx, args.gameId, "submitChoice", args.participantId.toString(), `${args.choice} turnIdx=${game.currentTurnIndex}`);

    // Pick a prompt, avoiding recently used ones
    const usedIds = turns
      .filter((t) => t.promptId)
      .map((t) => t.promptId!);
    const rawMode = game.promptMode ?? "normal";
    const gameMode: "normal" | "deep" = rawMode === "spicy" ? "deep" : (rawMode === "deep" ? "deep" : "normal");
    const prompt = pickRandomPrompt(args.choice, gameMode, usedIds);

    await ctx.db.patch(currentTurn._id, {
      choice: args.choice,
      promptId: prompt.id,
      promptText: JSON.stringify({ en: prompt.text, ja: prompt.ja }),
      promptResponseType: prompt.responseType,
      status: "waiting_for_response",
    });
  },
});

export const submitResponse = mutation({
  args: {
    gameId: v.id("truthOrDareGames"),
    participantId: v.id("participants"),
    responseText: v.optional(v.string()),
    responseMediaUrl: v.optional(v.string()),
    responseStorageId: v.optional(v.id("_storage")),
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");
    if (game.status !== "active") throw new Error("Game is not active");
    await requireCaller(ctx, args.participantId, args.token, "truthOrDare.submitResponse");
    if (game.currentTurnParticipantId !== args.participantId) {
      throw new Error("Not your turn");
    }
    if (args.responseText !== undefined && args.responseText.length > 2000) {
      throw new Error("Answer too long (max 2000 characters)");
    }
    // A drawing arrives as a file the submit-response route has checked and stored. A URL is not accepted:
    // it would be shown to the whole room whatever it points at.
    if (args.responseMediaUrl !== undefined) throw new Error("Unsupported drawing");

    // Find current turn (filter server-side instead of collecting all turns)
    const currentTurn = await ctx.db
      .query("truthOrDareTurns")
      .withIndex("by_gameId", (q) => q.eq("gameId", args.gameId))
      .filter((q) =>
        q.and(
          q.eq(q.field("turnIndex"), game.currentTurnIndex),
          q.eq(q.field("status"), "waiting_for_response")
        )
      )
      .first();
    // Already submitted (double-click) — ignore silently. False tells the route its drawing was not taken
    if (!currentTurn) return false;

    await trace(ctx, args.gameId, "submitResponse", args.participantId.toString(), args.responseText ? "text" : "media");

    const mediaUrl = args.responseStorageId ? await storedDrawingUrl(ctx, args.responseStorageId) : undefined;

    await ctx.db.patch(currentTurn._id, {
      responseText: args.responseText,
      responseMediaUrl: mediaUrl,
      // Kept next to the URL so the room purge can delete the file
      responseStorageId: args.responseStorageId,
      status: "completed",
      completedAt: Date.now(),
    });
    return true;
  },
});

export const submitTranslation = mutation({
  args: {
    turnId: v.id("truthOrDareTurns"),
    translatedText: v.string(),
    callerId: v.optional(v.id("participants")),
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const turn = await ctx.db.get(args.turnId);
    if (!turn) return;
    // Only the host app translates answers, and it names no caller here
    const game = await ctx.db.get(turn.gameId);
    if (game) await requireHost(ctx, game.roomId, args.callerId, args.token, "truthOrDare.submitTranslation");
    // Only a finished text answer has a translation. The host app posts the same one from every poll until
    // it sees it stored, so the first is kept and the rest are dropped without a write.
    if (turn.status !== "completed" || !turn.responseText || turn.translatedResponseText) return;
    if (args.translatedText.length > 8000) throw new Error("Translation too long (max 8000 characters)");
    await ctx.db.patch(args.turnId, {
      translatedResponseText: args.translatedText,
    });
  },
});

export const advanceTurn = mutation({
  args: {
    gameId: v.id("truthOrDareGames"),
    participantId: v.id("participants"),
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");
    if (game.status !== "active") return;

    // Only host can advance
    const caller = await requireCaller(ctx, args.participantId, args.token, "truthOrDare.advanceTurn");
    if (!caller) throw new Error("Participant not found");
    // Allow room host or game host
    if (args.participantId !== game.hostParticipantId && caller.role !== "host") {
      throw new Error("Only the host can advance turns");
    }
    // "Room host" above is any room's host; it has to be this room's
    if (caller.roomId !== game.roomId) authFail("truthOrDare.advanceTurn", "not in this room");

    const latestTurn = await currentTurnOf(ctx, game);

    // Older iOS builds have no other call to make for Keep Playing, so a host call that arrives
    // while the next turn is already waiting records the round break acknowledgement when one is
    // due. Otherwise it is the double tap it always was. No time guard: one that swallowed a quick
    // Keep Playing would leave guests behind the break with no way for that build to retry.
    if (latestTurn?.status === "waiting_for_choice") {
      const acked = await ackRoundBreak(ctx, game, await countCompletedTurns(ctx, game._id));
      await trace(ctx, args.gameId, acked ? "advanceTurn:roundBreakAck" : "advanceTurn:duplicate", args.participantId.toString(), `turnIdx=${game.currentTurnIndex} already waiting`);
      return;
    }

    // No client offers Next Turn while a player is answering, so this is a late duplicate. Dealing
    // the next seat here would orphan the open turn; hostSkipTurn is the way past it.
    if (latestTurn?.status === "waiting_for_response") {
      await trace(ctx, args.gameId, "advanceTurn:duplicate", args.participantId.toString(), `turnIdx=${game.currentTurnIndex} answering`);
      return;
    }

    await trace(ctx, args.gameId, "advanceTurn", args.participantId.toString(), `from=${game.currentTurnIndex}`);

    if (!game.playerOrder || game.playerOrder.length === 0) {
      throw new Error("Invalid game state: no players in game");
    }
    // Reads the next seat's participant so a kicked player is never dealt a turn
    await advanceToNextSeat(ctx, game, args.participantId);
  },
});

/** The host continued past the round break. `completedTurns` is the count the host was looking at. */
export const acknowledgeRoundBreak = mutation({
  args: {
    gameId: v.id("truthOrDareGames"),
    participantId: v.id("participants"),
    completedTurns: v.number(),
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");
    if (game.status !== "active") return;

    const caller = await requireCaller(ctx, args.participantId, args.token, "truthOrDare.acknowledgeRoundBreak");
    if (!caller) throw new Error("Participant not found");
    if (args.participantId !== game.hostParticipantId && caller.role !== "host") {
      throw new Error("Only the host can continue the game");
    }
    // "Room host" above is any room's host; it has to be this room's
    if (caller.roomId !== game.roomId) authFail("truthOrDare.acknowledgeRoundBreak", "not in this room");

    const completed = await countCompletedTurns(ctx, args.gameId);
    if (completed !== args.completedTurns) {
      await trace(ctx, args.gameId, "roundBreakAck:stale", args.participantId.toString(), `saw=${args.completedTurns} now=${completed}`);
      return;
    }

    // Not tied to the turn's status: recording this is harmless in any state, and a turn that has
    // already moved on can still be skipped and dealt again, which would bring the break back
    if (await ackRoundBreak(ctx, game, completed)) {
      await trace(ctx, args.gameId, "roundBreakAck", args.participantId.toString(), `turns=${completed}`);
    }
  },
});

export const skipTurn = mutation({
  args: {
    gameId: v.id("truthOrDareGames"),
    participantId: v.id("participants"),
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");
    if (game.status !== "active") return;
    await requireCaller(ctx, args.participantId, args.token, "truthOrDare.skipTurn");

    await trace(ctx, args.gameId, "skipTurn", args.participantId.toString(), `turnIdx=${game.currentTurnIndex}`);

    // This re-deals the caller's own turn. A host whose Skip arrives after the turn moved on must
    // not be dealt a turn at someone else's seat; skipping another player is hostSkipTurn.
    if (game.currentTurnParticipantId !== args.participantId) {
      const caller = await ctx.db.get(args.participantId);
      if (!caller) throw new Error("Participant not found");
      if (args.participantId !== game.hostParticipantId && caller.role !== "host") {
        throw new Error("Not your turn");
      }
      return;
    }

    // A late or repeated tap after the turn completed must not deal a second turn at this seat
    const turn = await currentTurnOf(ctx, game);
    if (!isOpen(turn)) return;

    await ctx.db.patch(turn._id, {
      status: "skipped",
      completedAt: Date.now(),
    });

    // Create a new turn for the SAME player (not the next one)
    await openTurn(ctx, game._id, game.currentTurnIndex, args.participantId, 0);
  },
});

/** The host moves the game past another player's turn. `turnId` is the turn the host was looking at. */
export const hostSkipTurn = mutation({
  args: {
    gameId: v.id("truthOrDareGames"),
    participantId: v.id("participants"),
    turnId: v.id("truthOrDareTurns"),
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");
    if (game.status !== "active") return;

    const caller = await requireCaller(ctx, args.participantId, args.token, "truthOrDare.hostSkipTurn");
    if (!caller) throw new Error("Participant not found");
    if (args.participantId !== game.hostParticipantId && caller.role !== "host") {
      throw new Error("Only the host can skip another player's turn");
    }
    // "Room host" above is any room's host; it has to be this room's
    if (caller.roomId !== game.roomId) authFail("truthOrDare.hostSkipTurn", "not in this room");

    // A second tap or a client retry finds the next player's turn here and must not skip them too
    const turn = await currentTurnOf(ctx, game);
    if (!isOpen(turn) || turn._id !== args.turnId) {
      await trace(ctx, args.gameId, "hostSkipTurn:stale", args.participantId.toString(), `turnIdx=${game.currentTurnIndex}`);
      return;
    }

    await trace(ctx, args.gameId, "hostSkipTurn", args.participantId.toString(), `turnIdx=${game.currentTurnIndex} ${turn.status}`);
    await skipOpenTurn(ctx, game, turn, args.participantId);
  },
});

export const submitRating = mutation({
  args: {
    turnId: v.id("truthOrDareTurns"),
    participantId: v.id("participants"),
    score: v.number(),
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const score = Math.round(args.score * 2) / 2; // snap to nearest 0.5
    // Written this way round so that NaN, which fails every comparison, is refused too
    if (!(score >= 1 && score <= 10)) throw new Error("Score must be 1-10");

    const turn = await ctx.db.get(args.turnId);
    if (!turn) throw new Error("Turn not found");
    if (turn.status !== "completed") throw new Error("Turn not completed yet");

    // The room, not the game's player list: someone who joined after the game started sees the turn and may rate it
    const rater = await requireCaller(ctx, args.participantId, args.token, "truthOrDare.submitRating");
    const game = await ctx.db.get(turn.gameId);
    if (rater && game && rater.roomId !== game.roomId) authFail("truthOrDare.submitRating", "not in this room");
    // Each rater adds an entry, so the array has to be bounded by who is really in the room: any
    // well-formed participant id would otherwise add one
    if (!game || !rater || rater.roomId !== game.roomId) throw new Error("Not a member of this room");

    // Don't let the active player rate themselves
    if (turn.participantId === args.participantId) return;

    await trace(ctx, turn.gameId, "submitRating", args.participantId.toString(), `score=${score} turn=${args.turnId}`);

    const ratings = turn.ratings ?? [];
    // Replace existing rating from this participant
    const filtered = ratings.filter((r) => r.participantId !== args.participantId);
    filtered.push({ participantId: args.participantId, score });

    await ctx.db.patch(args.turnId, { ratings: filtered });
  },
});

/** Ends the game and posts its summary: the host's End Game, or rotation finding fewer than two players left */
async function finishGame(ctx: MutationCtx, game: Game, senderId: Id<"participants">): Promise<void> {
  // Mark as completed if still active
  if (game.status === "active") {
    await ctx.db.patch(game._id, {
      status: "completed",
      completedAt: Date.now(),
    });
  }

  // Compute and post the summary
  const turns = await ctx.db
    .query("truthOrDareTurns")
    .withIndex("by_gameId", (q) => q.eq("gameId", game._id))
    .collect();

  const participants = await ctx.db
    .query("participants")
    .withIndex("by_roomId", (q) => q.eq("roomId", game.roomId))
    .collect();

  const playerScores: Record<string, { total: number; count: number }> = {};
  let totalCompletedTurns = 0;
  for (const t of turns) {
    if (t.status === "completed") totalCompletedTurns++;
    const ratings = t.ratings ?? [];
    if (ratings.length === 0) continue;
    const pid = t.participantId.toString();
    const avg = ratings.reduce((s, r) => s + r.score, 0) / ratings.length;
    if (!playerScores[pid]) playerScores[pid] = { total: 0, count: 0 };
    playerScores[pid].total += avg;
    playerScores[pid].count += 1;
  }

  const playerSummaries = game.playerOrder.map((pid) => {
    const p = participants.find((pp) => pp._id === pid);
    const scores = playerScores[pid.toString()];
    return {
      name: p?.nickname ?? "?",
      avatar: p?.avatar?.value ?? "cat",
      avgRating: scores ? Math.round((scores.total / scores.count) * 10) / 10 : null,
      turnsRated: scores?.count ?? 0,
    };
  });

  const summaryData = {
    gameType: "Truth or Dare",
    totalTurns: totalCompletedTurns,
    players: playerSummaries,
  };

  await ctx.db.insert("messages", {
    roomId: game.roomId,
    senderId,
    kind: "system",
    status: "processed",
    text: `truth_or_dare_summary:${JSON.stringify(summaryData)}`,
    createdAt: Date.now(),
  });
}

export const endGame = mutation({
  args: {
    gameId: v.id("truthOrDareGames"),
    participantId: v.id("participants"),
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    // A second End Game, or one that lands after the server ended the game itself, must not post
    // another summary
    if (!game || game.status !== "active") return;
    const caller = await requireCaller(ctx, args.participantId, args.token, "truthOrDare.endGame");
    // Until tokens anyone could end the game. Both apps only offer End Game to the host.
    const isRoomHost = caller?.role === "host" && caller.roomId === game.roomId;
    if (caller && args.participantId !== game.hostParticipantId && !isRoomHost) {
      authFail("truthOrDare.endGame", "not the host");
    }
    await finishGame(ctx, game, args.participantId);
  },
});

// Post summary for a completed game (can be called by any participant)
export const postSummary = mutation({
  args: {
    roomId: v.id("rooms"),
    participantId: v.id("participants"),
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireMember(ctx, args.roomId, args.participantId, args.token, "truthOrDare.postSummary");
    // Find the most recently completed game
    const allGames = await ctx.db
      .query("truthOrDareGames")
      .withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
      .collect();
    const game = allGames
      .filter((g) => g.status === "completed")
      .sort((a, b) => (b.completedAt ?? b.createdAt) - (a.completedAt ?? a.createdAt))[0];
    if (!game) return;

    // Check if summary already posted
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
      .collect();
    const hasSummary = messages.some(
      (m) => m.kind === "system" && m.text?.startsWith("truth_or_dare_summary:")
        && m.createdAt >= game.createdAt
    );
    if (hasSummary) return;

    // Compute and post
    const turns = await ctx.db
      .query("truthOrDareTurns")
      .withIndex("by_gameId", (q) => q.eq("gameId", game._id))
      .collect();

    const participants = await ctx.db
      .query("participants")
      .withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
      .collect();

    const playerScores: Record<string, { total: number; count: number }> = {};
    let totalCompletedTurns = 0;
    for (const t of turns) {
      if (t.status === "completed") totalCompletedTurns++;
      const ratings = t.ratings ?? [];
      if (ratings.length === 0) continue;
      const pid = t.participantId.toString();
      const avg = ratings.reduce((s, r) => s + r.score, 0) / ratings.length;
      if (!playerScores[pid]) playerScores[pid] = { total: 0, count: 0 };
      playerScores[pid].total += avg;
      playerScores[pid].count += 1;
    }

    const playerSummaries = game.playerOrder.map((pid) => {
      const p = participants.find((pp) => pp._id === pid);
      const scores = playerScores[pid.toString()];
      return {
        name: p?.nickname ?? "?",
        avatar: p?.avatar?.value ?? "cat",
        avgRating: scores ? Math.round((scores.total / scores.count) * 10) / 10 : null,
        turnsRated: scores?.count ?? 0,
      };
    });

    await ctx.db.insert("messages", {
      roomId: args.roomId,
      senderId: args.participantId,
      kind: "system",
      status: "processed",
      text: `truth_or_dare_summary:${JSON.stringify({
        gameType: "Truth or Dare",
        totalTurns: totalCompletedTurns,
        players: playerSummaries,
      })}`,
      createdAt: Date.now(),
    });
  },
});

// ─── Internal scheduled mutations ────────────────────────────────────────────

/**
 * Looks at whoever holds an open turn and moves the game on when they are not there to take it.
 * The chain belongs to one turn: it re-arms itself until that turn is answered or skipped, so it
 * covers a player who chose and then left as well as one who never chose. `misses` is how many
 * looks in a row found the player away, counting this turn's deal.
 */
export const internalAbsenceCheck = internalMutation({
  args: {
    turnId: v.id("truthOrDareTurns"),
    misses: v.number(),
  },
  handler: async (ctx, args) => {
    // Every return above the re-arm ends the chain: the state this check was scheduled for is gone
    const turn = await ctx.db.get(args.turnId);
    if (!isOpen(turn)) return;
    const game = await ctx.db.get(turn.gameId);
    if (!game || game.status !== "active") return;
    if ((await currentTurnOf(ctx, game))?._id !== turn._id) return;
    // Closing a room does not end its game, so this is what stops the chain for an abandoned room
    const room = await ctx.db.get(game.roomId);
    if (!room || room.status === "closed") return;

    const now = Date.now();
    const player = await ctx.db.get(turn.participantId);
    let misses = 0;
    if (!isPresent(player, now)) {
      misses = Math.min(args.misses + 1, ABSENCE_MISSES_TO_SKIP);
      // A kicked player cannot come back, so there is nothing to wait a second look for
      if (!player || misses >= ABSENCE_MISSES_TO_SKIP) {
        // With nobody here to take the next turn, skipping would deal and skip turns forever in
        // an empty room. Keep looking instead: the skip happens once someone is back.
        let someoneWaiting = false;
        for (const pid of game.playerOrder) {
          if (pid === turn.participantId) continue;
          if (isPresent(await ctx.db.get(pid), now)) {
            someoneWaiting = true;
            break;
          }
        }
        if (someoneWaiting) {
          await trace(ctx, game._id, "autoSkip", turn.participantId.toString(), `turnIdx=${turn.turnIndex} ${turn.status}`);
          await skipOpenTurn(ctx, game, turn, game.hostParticipantId);
          return;
        }
      }
    }

    // Not traced: todTrace would grow by a row every look
    await ctx.scheduler.runAfter(ABSENCE_CHECK_MS, internal.truthOrDare.internalAbsenceCheck, {
      turnId: turn._id,
      misses,
    });
  },
});

// ─── Queries ────────────────────────────────────────────────────────────────

export const getActiveTruthOrDare = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    // Find active OR most recently completed game
    const allGames = await ctx.db
      .query("truthOrDareGames")
      .withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
      .collect();

    // Prefer active, fall back to most recently completed/canceled
    const game = allGames.find((g) => g.status === "active")
      ?? allGames
          .filter((g) => g.status === "completed" || g.status === "canceled")
          .sort((a, b) => (b.completedAt ?? b.createdAt) - (a.completedAt ?? a.createdAt))[0]
      ?? null;
    if (!game) return null;

    // Get all turns for this game
    const turns = await ctx.db
      .query("truthOrDareTurns")
      .withIndex("by_gameId", (q) => q.eq("gameId", game._id))
      .collect();

    // Get current turn (latest for current turn index)
    const currentTurn = turns
      .filter((t) => t.turnIndex === game.currentTurnIndex)
      .sort((a, b) => b.createdAt - a.createdAt)[0] ?? null;

    // Get participants for display
    const participants = await ctx.db
      .query("participants")
      .withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
      .collect();

    const playerInfo = game.playerOrder.map((pid) => {
      const p = participants.find((pp) => pp._id === pid);
      return {
        participantId: pid,
        nickname: p?.nickname ?? "?",
        avatarValue: p?.avatar?.value ?? "cat",
        online: p?.online ?? false,
      };
    });

    // All completed turns with ratings for the summary (exclude responseMediaUrl to keep payload small)
    const completedTurnsList = turns
      .filter((t) => t.status === "completed")
      .map((t) => ({
        _id: t._id,
        participantId: t.participantId,
        choice: t.choice,
        promptText: t.promptText,
        responseText: t.responseText,
        ratings: t.ratings ?? [],
        completedAt: t.completedAt,
      }));

    // Safety: strip base64 data URLs from currentTurn to prevent WebSocket crashes.
    // CDN URLs (from file storage) pass through fine. Old data URLs from before
    // the storage conversion would crash every subscriber's WebSocket.
    const safeTurn = currentTurn ? {
      ...currentTurn,
      responseMediaUrl: currentTurn.responseMediaUrl?.startsWith("data:")
        ? undefined
        : currentTurn.responseMediaUrl,
      // The server's handle for deleting the file; clients only use the URL
      responseStorageId: undefined,
    } : null;

    return {
      ...game,
      currentTurn: safeTurn,
      completedTurns: completedTurnsList.length,
      completedTurnsList,
      totalTurns: turns.length,
      playerInfo,
    };
  },
});

// ─── Trace log queries ───────────────────────────────────────────────────────

export const getTrace = query({
  args: {
    gameId: v.id("truthOrDareGames"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const entries = await ctx.db
      .query("todTrace")
      .withIndex("by_gameId", (q) => q.eq("gameId", args.gameId))
      .collect();
    // Return newest first, limited
    return entries
      .sort((a, b) => b.ts - a.ts)
      .slice(0, args.limit ?? 200);
  },
});

// Trace rows hold game and participant ids, so every trace query must be scoped to one game or room.

export const getTraceByRoom = query({
  args: {
    roomId: v.id("rooms"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Find active game for this room
    const games = await ctx.db
      .query("truthOrDareGames")
      .withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
      .collect();
    const game = games.find((g) => g.status === "active") ?? games.sort((a, b) => b.createdAt - a.createdAt)[0];
    if (!game) return [];
    const entries = await ctx.db
      .query("todTrace")
      .withIndex("by_gameId", (q) => q.eq("gameId", game._id))
      .collect();
    return entries
      .sort((a, b) => b.ts - a.ts)
      .slice(0, args.limit ?? 200);
  },
});

