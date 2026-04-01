import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

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

// ─── Mutations ──────────────────────────────────────────────────────────────

export const createGame = mutation({
  args: {
    roomId: v.id("rooms"),
    hostParticipantId: v.id("participants"),
    promptMode: v.optional(v.union(v.literal("normal"), v.literal("deep"), v.literal("spicy"))),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) throw new Error("Room not found");
    if (room.status === "closed") throw new Error("Room is closed");

    // Get online participants
    const participants = await ctx.db
      .query("participants")
      .withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
      .collect();
    const onlinePlayers = participants.filter((p) => p.online && !p.departed);
    if (onlinePlayers.length < 2) throw new Error("Need at least 2 players");

    // Shuffle player order
    const playerIds = onlinePlayers.map((p) => p._id);
    for (let i = playerIds.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [playerIds[i], playerIds[j]] = [playerIds[j], playerIds[i]];
    }

    const now = Date.now();

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
    await ctx.db.insert("truthOrDareTurns", {
      gameId,
      turnIndex: 0,
      participantId: playerIds[0],
      status: "waiting_for_choice",
      createdAt: now,
    });

    return gameId;
  },
});

export const submitChoice = mutation({
  args: {
    gameId: v.id("truthOrDareGames"),
    participantId: v.id("participants"),
    choice: v.union(v.literal("truth"), v.literal("dare")),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");
    if (game.status !== "active") throw new Error("Game is not active");
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
    if (!currentTurn) throw new Error("No active turn found");

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
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");
    if (game.status !== "active") throw new Error("Game is not active");
    if (game.currentTurnParticipantId !== args.participantId) {
      throw new Error("Not your turn");
    }

    // Find current turn
    const turns = await ctx.db
      .query("truthOrDareTurns")
      .withIndex("by_gameId", (q) => q.eq("gameId", args.gameId))
      .collect();
    const currentTurn = turns.find(
      (t) => t.turnIndex === game.currentTurnIndex && t.status === "waiting_for_response"
    );
    if (!currentTurn) throw new Error("No active turn waiting for response");

    // Resolve storage URL if a file was uploaded
    let mediaUrl = args.responseMediaUrl;
    if (args.responseStorageId) {
      const url = await ctx.storage.getUrl(args.responseStorageId);
      if (url) mediaUrl = url;
    }

    await ctx.db.patch(currentTurn._id, {
      responseText: args.responseText,
      responseMediaUrl: mediaUrl,
      status: "completed",
      completedAt: Date.now(),
    });
  },
});

export const submitTranslation = mutation({
  args: {
    turnId: v.id("truthOrDareTurns"),
    translatedText: v.string(),
  },
  handler: async (ctx, args) => {
    const turn = await ctx.db.get(args.turnId);
    if (!turn) return;
    await ctx.db.patch(args.turnId, {
      translatedResponseText: args.translatedText,
    });
  },
});

export const advanceTurn = mutation({
  args: {
    gameId: v.id("truthOrDareGames"),
    participantId: v.id("participants"),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");
    if (game.status !== "active") return;

    // Only host can advance
    const host = await ctx.db.get(game.hostParticipantId);
    const caller = await ctx.db.get(args.participantId);
    if (!caller) throw new Error("Participant not found");
    // Allow room host or game host
    if (args.participantId !== game.hostParticipantId && caller.role !== "host") {
      throw new Error("Only the host can advance turns");
    }

    // Get online players to skip disconnected ones
    const participants = await ctx.db
      .query("participants")
      .withIndex("by_roomId", (q) => q.eq("roomId", game.roomId))
      .collect();
    const onlineIds = new Set(
      participants.filter((p) => p.online && !p.departed).map((p) => p._id.toString())
    );

    // Find next online player
    let nextIndex = game.currentTurnIndex + 1;
    let attempts = 0;
    while (attempts < game.playerOrder.length) {
      const wrappedIndex = nextIndex % game.playerOrder.length;
      if (onlineIds.has(game.playerOrder[wrappedIndex].toString())) {
        const now = Date.now();
        await ctx.db.patch(args.gameId, {
          currentTurnIndex: wrappedIndex,
          currentTurnParticipantId: game.playerOrder[wrappedIndex],
        });
        await ctx.db.insert("truthOrDareTurns", {
          gameId: args.gameId,
          turnIndex: wrappedIndex,
          participantId: game.playerOrder[wrappedIndex],
          status: "waiting_for_choice",
          createdAt: now,
        });
        return;
      }
      nextIndex++;
      attempts++;
    }

    // No online players left — end game
    await ctx.db.patch(args.gameId, {
      status: "completed",
      completedAt: Date.now(),
    });
  },
});

export const skipTurn = mutation({
  args: {
    gameId: v.id("truthOrDareGames"),
    participantId: v.id("participants"),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");
    if (game.status !== "active") return;
    if (game.currentTurnParticipantId !== args.participantId) {
      throw new Error("Not your turn");
    }

    // Mark current turn as skipped
    const turns = await ctx.db
      .query("truthOrDareTurns")
      .withIndex("by_gameId", (q) => q.eq("gameId", args.gameId))
      .collect();
    const currentTurn = turns.find(
      (t) =>
        t.turnIndex === game.currentTurnIndex &&
        (t.status === "waiting_for_choice" || t.status === "waiting_for_response")
    );
    if (currentTurn) {
      await ctx.db.patch(currentTurn._id, {
        status: "skipped",
        completedAt: Date.now(),
      });
    }

    // Create a new turn for the SAME player (not the next one)
    await ctx.db.insert("truthOrDareTurns", {
      gameId: args.gameId,
      turnIndex: game.currentTurnIndex,
      participantId: args.participantId,
      status: "waiting_for_choice",
      createdAt: Date.now(),
    });
  },
});

export const submitRating = mutation({
  args: {
    turnId: v.id("truthOrDareTurns"),
    participantId: v.id("participants"),
    score: v.number(),
  },
  handler: async (ctx, args) => {
    if (args.score < 1 || args.score > 10 || (args.score * 2) % 1 !== 0) throw new Error("Score must be 1-10 in 0.5 increments");

    const turn = await ctx.db.get(args.turnId);
    if (!turn) throw new Error("Turn not found");
    if (turn.status !== "completed") throw new Error("Turn not completed yet");

    // Don't let the active player rate themselves
    if (turn.participantId === args.participantId) return;

    const ratings = turn.ratings ?? [];
    // Replace existing rating from this participant
    const filtered = ratings.filter((r) => r.participantId !== args.participantId);
    filtered.push({ participantId: args.participantId, score: args.score });

    await ctx.db.patch(args.turnId, { ratings: filtered });
  },
});

export const endGame = mutation({
  args: {
    gameId: v.id("truthOrDareGames"),
    participantId: v.id("participants"),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) return;

    // Mark as completed if still active
    if (game.status === "active") {
      await ctx.db.patch(args.gameId, {
        status: "completed",
        completedAt: Date.now(),
      });
    }

    // Always compute and post summary
    const turns = await ctx.db
      .query("truthOrDareTurns")
      .withIndex("by_gameId", (q) => q.eq("gameId", args.gameId))
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
      senderId: args.participantId,
      kind: "system",
      status: "processed",
      text: `truth_or_dare_summary:${JSON.stringify(summaryData)}`,
      createdAt: Date.now(),
    });
  },
});

// Post summary for a completed game (can be called by any participant)
export const postSummary = mutation({
  args: {
    roomId: v.id("rooms"),
    participantId: v.id("participants"),
  },
  handler: async (ctx, args) => {
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

// ─── Queries ────────────────────────────────────────────────────────────────

export const getActiveTruthOrDare = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    // Find active OR most recently completed game
    const allGames = await ctx.db
      .query("truthOrDareGames")
      .withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
      .collect();

    // Prefer active, fall back to most recently completed
    const game = allGames.find((g) => g.status === "active")
      ?? allGames
          .filter((g) => g.status === "completed")
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

    return {
      ...game,
      currentTurn,
      completedTurns: completedTurnsList.length,
      completedTurnsList,
      totalTurns: turns.length,
      playerInfo,
    };
  },
});
