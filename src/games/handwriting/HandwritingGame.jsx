import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button3D } from '../../components/ui/Button3D';
import { useI18n } from '../../context/I18nContext';
import { useStudent } from '../../context/StudentContext';
import { useTheme } from '../../context/ThemeContext';
import { soundEngine, speakEnglish } from '../../services/audio';
import { HonorSubmissionCard } from '../../components/HonorSubmissionCard';
import {
  FOUR_LINES,
  getLetterStrokes,
  evaluateHandwriting,
  matchTracingStroke,
  evaluateTracingCompletion
} from '../../services/alphabetStrokes';
import confetti from 'canvas-confetti';
import {
  ArrowLeft, Volume2, RotateCcw, Check, Sparkles, Trophy,
  Undo2, PenTool, HelpCircle, ArrowRight, ShieldCheck, Flame, BookOpen,
  ChevronLeft, ChevronRight
} from 'lucide-react';

const LETTER_SLOT_WIDTH = 65;
const BOARD_PADDING_X = 35;

export const HandwritingGame = ({
  settings,
  words = [],
  qualifyingBook,
  onBack
}) => {
  const { t } = useI18n();
  const { currentStudent } = useStudent();
  const { isDark } = useTheme();

  // 模式：'tracing' (描寫自學版 - 有螢光導引，不登排行榜) | 'challenge' (實戰默寫版 - 無導引，評分登榜)
  const [playMode, setPlayMode] = useState('tracing');

  // 年級自適應判定：1年級大寫、2年級小寫、3~6年級單字四線三格長卷
  const studentGradeNum = useMemo(() => {
    if (settings?.selectedOptionId === 'g1' || (qualifyingBook === '1' && settings?.alphaMode)) return 1;
    if (settings?.selectedOptionId === 'g2') return 2;
    if (currentStudent?.grade) {
      const g = parseInt(currentStudent.grade, 10);
      if (g >= 1 && g <= 6) return g;
    }
    return 3;
  }, [currentStudent, settings, qualifyingBook]);

  // 出題列表 (題目物件清單)
  const [questions, setQuestions] = useState([]);
  const [qIndex, setQIndex] = useState(0);

  // 當前聚焦之字母索引 (在單字模式下，追蹤 0, 1, 2... 字元)
  const [activeLetterIdx, setActiveLetterIdx] = useState(0);

  // 描寫版：已成功描寫完成的字母集合
  const [completedLetterIndices, setCompletedLetterIndices] = useState(new Set());

  // 描寫版：當前聚焦字母正在進行的筆劃序號 (0, 1, 2...)
  const [activeStrokeStep, setActiveStrokeStep] = useState(0);

  // 描寫版採「部件完成集合」而非強迫第 N 筆配對第 N 筆；編號只作建議筆順。
  const [traceMatchesByLetter, setTraceMatchesByLetter] = useState({});
  const [traceMatchHistory, setTraceMatchHistory] = useState([]);
  const [showOrderNumbers, setShowOrderNumbers] = useState(true);
  const [traceHint, setTraceHint] = useState('筆順編號僅供參考，一筆連寫（如 a、d、m）也能直接過關！');

  // 畫布筆跡歷史 (每一劃為一組 points: [{x, y}, ...])
  const [strokes, setStrokes] = useState([]);
  const [currentStroke, setCurrentStroke] = useState(null);

  // 追蹤每個字母已描寫的正規化筆畫（供累積整字墨跡完成檢查 & Undo 還原）
  const letterStrokesRef = useRef({});

  // 實戰版評分反饋與通過題數統計（首通答對數供 HonorSubmissionCard 計算答對率與獎狀，與分數分離）
  const [evalResult, setEvalResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 結算狀態
  const [isFinished, setIsFinished] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(() => Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [totalScoreSum, setTotalScoreSum] = useState(0);
  const [scoredCount, setScoredCount] = useState(0);
  const [passedCount, setPassedCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [hasUsedTracingInRound, setHasUsedTracingInRound] = useState(false);

  const canvasRef = useRef(null);
  const boardScrollRef = useRef(null);
  const isDrawingRef = useRef(false);

  // ── 題庫初始化 ──
  useEffect(() => {
    let list = [];
    const isAlphabetMode = Boolean(
      studentGradeNum === 1 ||
      studentGradeNum === 2 ||
      qualifyingBook === 'abc' ||
      settings?.alphaMode ||
      (settings?.selectedUnits && settings.selectedUnits.includes('abc'))
    );

    if (isAlphabetMode) {
      // 一年級預設大寫、二年級預設小寫；實際內容尊重大廳 upper/lower/mixed 膠囊。
      const alphaMode = ['upper', 'lower', 'mixed'].includes(settings?.alphaMode)
        ? settings.alphaMode
        : studentGradeNum === 2 ? 'lower' : 'upper';
      const shuffledBase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').sort(() => 0.5 - Math.random());
      const mixedStartsLower = Math.random() >= 0.5;
      const alphabetChars = shuffledBase.map((letter, index) => {
        if (alphaMode === 'lower') return letter.toLowerCase();
        if (alphaMode === 'mixed') {
          const useLower = index % 2 === (mixedStartsLower ? 0 : 1);
          return useLower ? letter.toLowerCase() : letter;
        }
        return letter;
      });
      list = alphabetChars.slice(0, 10).map((char, i) => ({
        id: `char_${char}_${i}`,
        type: 'letter',
        targetChar: char,
        displayTitle: char === char.toLowerCase() ? `小寫字母 ${char}` : `大寫字母 ${char}`,
        wordStr: char,
        zh: char === char.toLowerCase() ? `請練習小寫字母 ${char}` : `請練習大寫字母 ${char}`
      }));
    } else {
      // 3~6 年級單字模式：篩選單元單字 (支援長單字如 supermarket, banana, apple)
      let filtered = words.filter(w => settings?.selectedUnits?.includes(`${w.book}-${w.lesson}`));
      if (filtered.length === 0 && words.length > 0) {
        filtered = words;
      }
      const pool = filtered.filter(w => w.en && /^[a-zA-Z]+$/.test(w.en.trim()));
      const shuffled = [...pool].sort(() => 0.5 - Math.random()).slice(0, 8);
      list = (shuffled.length > 0 ? shuffled : [
        { id: 'sample_apple', en: 'apple', zh: '蘋果' },
        { id: 'sample_cat', en: 'cat', zh: '貓' },
        { id: 'sample_book', en: 'book', zh: '書' }
      ]).map(w => ({
        id: w.id || w.en,
        type: 'word',
        wordStr: w.en.trim(),
        targetChar: w.en.trim()[0] || 'a',
        displayTitle: w.en,
        zh: w.zh || '單字筆順練習'
      }));
    }

    setQuestions(list);
    setQIndex(0);
    setActiveLetterIdx(0);
    setCompletedLetterIndices(new Set());
    setStrokes([]);
    setActiveStrokeStep(0);
    setTraceMatchesByLetter({});
    setTraceMatchHistory([]);
    letterStrokesRef.current = {};
    setTraceHint('筆順編號僅供參考，一筆連寫（如 a、d、m）也能直接過關！');
    setEvalResult(null);
    setTotalScoreSum(0);
    setScoredCount(0);
    setPassedCount(0);
    setStreak(0);
    setHasUsedTracingInRound(false);
    setSessionStartTime(Date.now());
  }, [studentGradeNum, words, settings, qualifyingBook]);

  // 當前目標題目
  const currentQ = questions[qIndex] || null;

  // 判斷是否為「多字母長單字模式」
  const isWordMode = Boolean(currentQ && currentQ.type === 'word' && currentQ.wordStr.length > 1);
  const wordChars = useMemo(() => {
    return currentQ?.wordStr?.split('') || ['A'];
  }, [currentQ]);

  // 🌟 動態四線三格寬高計算：一二年級單字方形大格 (100x120)；高年級單字依長度自適應細長長卷！
  const boardWidth = useMemo(() => {
    if (!isWordMode) return 100; // 一二年級單字母大方格
    // 高年級長單字 (如 supermarket: 11 字元 => 35*2 + 11*65 = 785)
    return BOARD_PADDING_X * 2 + wordChars.length * LETTER_SLOT_WIDTH;
  }, [isWordMode, wordChars]);

  const boardHeight = 120; // 標準 4 線高度 (top: 15, mid: 45, base: 75, bottom: 105)

  // 每個字母的槽位幾何資訊
  const slotList = useMemo(() => {
    if (!isWordMode) {
      return [{
        char: currentQ?.targetChar || 'A',
        center: 50,
        scale: 1,
        startX: 0,
        endX: 100,
        index: 0
      }];
    }
    return wordChars.map((c, i) => {
      const startX = BOARD_PADDING_X + i * LETTER_SLOT_WIDTH;
      const endX = startX + LETTER_SLOT_WIDTH;
      const center = startX + LETTER_SLOT_WIDTH / 2;
      return {
        char: c,
        center,
        scale: 0.82,
        startX,
        endX,
        index: i
      };
    });
  }, [isWordMode, wordChars, currentQ]);

  // 當前活躍的單字母
  const activeChar = slotList[activeLetterIdx]?.char || 'A';
  const activeSlot = slotList[activeLetterIdx] || slotList[0];
  const activeStrokeModel = useMemo(() => {
    return getLetterStrokes(activeChar) || getLetterStrokes('A');
  }, [activeChar]);

  const getFirstUnmatchedStroke = useCallback((letterIdx, matches = traceMatchesByLetter) => {
    const slot = slotList[letterIdx];
    const model = getLetterStrokes(slot?.char);
    if (!model) return 0;
    const matched = new Set(matches[letterIdx] || []);
    const nextIndex = model.strokes.findIndex((_, index) => !matched.has(index));
    return nextIndex === -1 ? model.strokes.length : nextIndex;
  }, [slotList, traceMatchesByLetter]);

  // 自動發音
  useEffect(() => {
    if (currentQ?.wordStr) {
      speakEnglish(currentQ.wordStr, { persona: 'standard_us' });
    }
  }, [currentQ]);

  // 自動滾動聚焦至當前描寫之字母槽位 (手機/平板上流暢平移)
  const scrollToActiveSlot = useCallback((idx) => {
    const container = boardScrollRef.current;
    if (!container || !isWordMode) return;
    const targetSlot = slotList[idx];
    if (!targetSlot) return;

    const slotRatio = targetSlot.center / boardWidth;
    const scrollTarget = slotRatio * container.scrollWidth - container.clientWidth / 2;
    container.scrollTo({
      left: Math.max(0, scrollTarget),
      behavior: 'smooth'
    });
  }, [isWordMode, slotList, boardWidth]);

  useEffect(() => {
    scrollToActiveSlot(activeLetterIdx);
  }, [activeLetterIdx, scrollToActiveSlot]);

  // ── 畫布重繪邏輯 (直接使用邏輯座標系映射，徹底消滅 DPR 縮放與跑格) ──
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    if (width === 0 || height === 0) return;

    // 重置所有變換矩陣，直接將 context 縮放映射為 boardWidth x boardHeight 邏輯座標系
    ctx.setTransform(width / boardWidth, 0, 0, height / boardHeight, 0, 0);
    ctx.clearRect(0, 0, boardWidth, boardHeight);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const allStrokes = currentStroke ? [...strokes, currentStroke] : strokes;

    allStrokes.forEach((stroke) => {
      if (stroke.length < 1) return;
      const baseWidth = isWordMode ? 4.8 : 5.8;

      if (stroke.length === 1) {
        ctx.beginPath();
        ctx.fillStyle = isDark ? '#7dd3fc' : '#0284c7';
        ctx.shadowColor = isDark ? 'rgba(56, 189, 248, 0.7)' : 'rgba(2, 132, 199, 0.35)';
        ctx.shadowBlur = isDark ? 4 : 1.5;
        ctx.arc(stroke[0].x, stroke[0].y, baseWidth * 0.55, 0, Math.PI * 2);
        ctx.fill();
        return;
      }

      ctx.beginPath();
      // 星光神筆墨水（夜光冷藍/日間寶石藍）
      ctx.lineWidth = baseWidth;
      ctx.strokeStyle = isDark ? '#38bdf8' : '#0284c7';
      ctx.shadowColor = isDark ? 'rgba(125, 211, 252, 0.75)' : 'rgba(2, 132, 199, 0.38)';
      ctx.shadowBlur = isDark ? 3.5 : 1.8;

      const p0 = stroke[0];
      ctx.moveTo(p0.x, p0.y);

      for (let i = 1; i < stroke.length; i++) {
        const pt = stroke[i];
        ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();
    });
  }, [strokes, currentStroke, isDark, boardWidth, boardHeight, isWordMode]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // 尺寸自動調整 (自適應高解析度螢幕 DPR 與動態縮放)
  const updateCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      const dpr = window.devicePixelRatio || 1;
      const targetW = Math.round(rect.width * dpr);
      const targetH = Math.round(rect.height * dpr);
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }
      redrawCanvas();
    }
  }, [redrawCanvas]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    updateCanvasSize();

    let resizeObserver = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        updateCanvasSize();
      });
      resizeObserver.observe(canvas);
    }

    window.addEventListener('resize', updateCanvasSize);
    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [updateCanvasSize, boardWidth]);

  // ── 防誤觸防滑動指針座標計算 (精確計算點擊相對百分比，與畫布 100% 絕對對齊) ──
  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return { x: 0, y: 0 };

    const clientX = e.clientX ?? (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    const clientY = e.clientY ?? (e.touches && e.touches[0] ? e.touches[0].clientY : 0);

    const normX = Math.max(0, Math.min(boardWidth, ((clientX - rect.left) / rect.width) * boardWidth));
    const normY = Math.max(0, Math.min(boardHeight, ((clientY - rect.top) / rect.height) * boardHeight));
    return { x: normX, y: normY };
  };

  const handlePointerDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      e.target.setPointerCapture(e.pointerId);
    } catch (err) {}
    isDrawingRef.current = true;
    const pt = getCanvasCoords(e);
    setCurrentStroke([pt]);
  };

  const handlePointerMove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDrawingRef.current) return;
    const pt = getCanvasCoords(e);

    setCurrentStroke(prev => {
      if (!prev) return [pt];
      const last = prev[prev.length - 1];
      const dist = Math.hypot(pt.x - last.x, pt.y - last.y);
      if (dist > 0.8) {
        return [...prev, pt];
      }
      return prev;
    });
  };

  const handlePointerUp = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    try {
      if (e?.target?.hasPointerCapture?.(e.pointerId)) {
        e.target.releasePointerCapture(e.pointerId);
      }
    } catch (err) {}
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    if (currentStroke && currentStroke.length >= 1) {
      // 支援 i/j 點點輕點（單點點擊自動補齊微小偏移以通過畫布與點雲重取樣）
      const finalizedStroke = currentStroke.length === 1
        ? [currentStroke[0], { x: currentStroke[0].x + 0.6, y: currentStroke[0].y + 0.6 }]
        : currentStroke;
      setCurrentStroke(null);

      // ── 描寫模式：支援一筆自然連寫 + 必要點/橫部件防漏檢核 ──
      if (playMode === 'tracing' && activeStrokeModel && activeSlot) {
        const normalizedStroke = finalizedStroke.map(point => ({
          x: 50 + (point.x - activeSlot.center) / activeSlot.scale,
          y: point.y
        }));
        const previousMatches = traceMatchesByLetter[activeLetterIdx] || [];
        const traceResult = matchTracingStroke({
          targetChar: activeChar,
          userStroke: normalizedStroke,
          completedStrokeIndices: previousMatches
        });

        const prevLetterStrokes = letterStrokesRef.current[activeLetterIdx] || [];
        const candidateLetterStrokes = [...prevLetterStrokes, normalizedStroke];
        const wholeCharCheck = evaluateTracingCompletion({
          targetChar: activeChar,
          userStrokes: candidateLetterStrokes
        });

        if (!traceResult.accepted && !wholeCharCheck.completed) {
          soundEngine.wrong();
          soundEngine.hapticPulse('strong');
          setTraceHint(
            wholeCharCheck.hintFeedback ||
            '這一筆離字母太遠，請沿著任一尚未完成的螢光部件再試一次。'
          );
          return;
        }

        letterStrokesRef.current[activeLetterIdx] = candidateLetterStrokes;
        const nextStrokes = [...strokes, finalizedStroke];
        setStrokes(nextStrokes);

        let mergedMatches = [...new Set([...previousMatches, ...traceResult.matchedIndices])].sort((a, b) => a - b);
        const letterFullyDone =
          wholeCharCheck.completed || mergedMatches.length >= activeStrokeModel.strokes.length;
        if (letterFullyDone) {
          mergedMatches = activeStrokeModel.strokes.map((_, idx) => idx);
        }

        const nextMatchesByLetter = {
          ...traceMatchesByLetter,
          [activeLetterIdx]: mergedMatches
        };
        setTraceMatchesByLetter(nextMatchesByLetter);
        setTraceMatchHistory(prev => [...prev, {
          letterIdx: activeLetterIdx,
          matchedIndices: mergedMatches
        }]);

        if (letterFullyDone) {
          const updatedSet = new Set(completedLetterIndices);
          updatedSet.add(activeLetterIdx);
          setCompletedLetterIndices(updatedSet);
          soundEngine.powerUp();
          soundEngine.hapticPulse('normal');

          const nextIncompleteSlot = slotList.find(slot => !updatedSet.has(slot.index));
          if (nextIncompleteSlot) {
            setActiveLetterIdx(nextIncompleteSlot.index);
            setActiveStrokeStep(getFirstUnmatchedStroke(nextIncompleteSlot.index, nextMatchesByLetter));
            setTraceHint(`✨「${activeChar}」完成！接著寫「${nextIncompleteSlot.char}」`);
          } else {
            confetti({ particleCount: 55, spread: 70, origin: { y: 0.6 } });
            setStreak(s => s + 1);
            setEvalResult({
              score: 100,
              stars: 3,
              passed: true,
              feedback: isWordMode
                ? `🎉 完成單字「${currentQ.wordStr}」四線三格描寫！`
                : '🎉 字形描寫完成！標準與一筆連寫都完美通過！'
            });
          }
        } else {
          soundEngine.brushChime(mergedMatches.length);
          soundEngine.hapticPulse('normal');
          setActiveStrokeStep(getFirstUnmatchedStroke(activeLetterIdx, nextMatchesByLetter));
          setTraceHint(
            wholeCharCheck.hintFeedback ||
            '寫得很棒！請繼續補上剩餘的螢光部件。'
          );
        }
        return;
      }

      setStrokes(prev => [...prev, finalizedStroke]);
    } else {
      setCurrentStroke(null);
    }
  };

  // 清除重寫
  const handleClear = () => {
    soundEngine.click();
    setStrokes([]);
    setCurrentStroke(null);
    setActiveLetterIdx(0);
    setActiveStrokeStep(0);
    setCompletedLetterIndices(new Set());
    setTraceMatchesByLetter({});
    setTraceMatchHistory([]);
    letterStrokesRef.current = {};
    setTraceHint('筆順編號僅供參考，一筆連寫（如 a、d、m）也能直接過關！');
    setEvalResult(null);
  };

  // 撤銷上一筆
  const handleUndo = () => {
    soundEngine.click();
    if (strokes.length > 0) {
      setStrokes(prev => prev.slice(0, -1));
      if (playMode === 'tracing' && traceMatchHistory.length > 0) {
        const removedEntry = traceMatchHistory[traceMatchHistory.length - 1];
        const prevArr = letterStrokesRef.current[removedEntry.letterIdx] || [];
        if (prevArr.length > 0) {
          letterStrokesRef.current[removedEntry.letterIdx] = prevArr.slice(0, -1);
        }
        const nextHistory = traceMatchHistory.slice(0, -1);
        const rebuiltMatches = {};
        nextHistory.forEach(entry => {
          rebuiltMatches[entry.letterIdx] = [...entry.matchedIndices].sort((a, b) => a - b);
        });
        const rebuiltCompleted = new Set();
        slotList.forEach(slot => {
          const requiredCount = getLetterStrokes(slot.char)?.strokes.length || 0;
          if ((rebuiltMatches[slot.index] || []).length >= requiredCount && requiredCount > 0) {
            rebuiltCompleted.add(slot.index);
          }
        });
        setTraceMatchHistory(nextHistory);
        setTraceMatchesByLetter(rebuiltMatches);
        setCompletedLetterIndices(rebuiltCompleted);
        setActiveLetterIdx(removedEntry.letterIdx);
        setActiveStrokeStep(getFirstUnmatchedStroke(removedEntry.letterIdx, rebuiltMatches));
        setTraceHint('已撤銷上一筆，請繼續完成尚未描寫的部件。');
      }
      setEvalResult(null);
    }
  };

  // 實戰默寫版：提交書寫評分 (支援長單字整詞各字母槽位自動判定)
  const handleEvaluateChallenge = () => {
    if (isSubmitting || strokes.length === 0) return;
    soundEngine.click();
    setIsSubmitting(true);

    if (!isWordMode) {
      // 一二年級單字母評估
      const result = evaluateHandwriting({
        targetChar: activeChar,
        userStrokes: strokes,
        isGuidedTracing: false
      });
      setEvalResult(result);
      setIsSubmitting(false);
      if (result.passed) {
        soundEngine.correct();
        soundEngine.hapticPulse('normal');
        setStreak(s => s + 1);
        confetti({ particleCount: 45, spread: 60, origin: { y: 0.6 } });
      } else {
        soundEngine.wrong();
        soundEngine.hapticPulse('strong');
        setStreak(0);
      }
      return;
    }

    // 🌟 高年級單字模式：將所有筆劃自動分配給最近的字母槽位進行綜合評分
    const slotStrokesMap = new Map();
    slotList.forEach(s => slotStrokesMap.set(s.index, []));

    strokes.forEach(stroke => {
      if (stroke.length === 0) return;
      // 計算筆劃平均中心點 X
      const avgX = stroke.reduce((sum, p) => sum + p.x, 0) / stroke.length;
      // 找到最近的字母槽位
      let bestSlot = slotList[0];
      let bestDist = 9999;
      slotList.forEach(s => {
        const d = Math.abs(avgX - s.center);
        if (d < bestDist) {
          bestDist = d;
          bestSlot = s;
        }
      });

      // 將座標轉換回該字母的標準模型空間 (100x120，中心在 50)
      const normalizedStroke = stroke.map(p => ({
        x: Math.round(50 + (p.x - bestSlot.center) / bestSlot.scale),
        y: p.y
      }));
      slotStrokesMap.get(bestSlot.index).push(normalizedStroke);
    });

    // 逐字母評分計算
    let totalScore = 0;
    const letterScores = [];

    slotList.forEach(s => {
      const userLetterStrokes = slotStrokesMap.get(s.index) || [];
      const res = evaluateHandwriting({
        targetChar: s.char,
        userStrokes: userLetterStrokes,
        isGuidedTracing: false
      });
      letterScores.push({ char: s.char, score: res.score, passed: res.passed, feedback: res.feedback });
      totalScore += res.score;
    });

    const rawAvgScore = Math.round(totalScore / slotList.length);
    const failedLetters = letterScores.filter(ls => !ls.passed);
    const allLettersPassed = failedLetters.length === 0;
    const avgScore = allLettersPassed ? rawAvgScore : Math.min(58, rawAvgScore);
    const passed = allLettersPassed && avgScore >= 60;
    const stars = !passed ? 1 : (avgScore >= 80 ? 3 : 2);

    const result = {
      score: avgScore,
      stars,
      passed,
      feedback: passed
        ? (avgScore >= 80
          ? `太棒了！單字「${currentQ.wordStr}」四線三格默寫極為精準！`
          : `默寫良好！注意字母間距與四線三格位置，繼續加油！`)
        : (failedLetters[0]?.feedback || `請參考標準四線三格基線，補齊缺少筆畫再試一次！`),
      letterScores
    };

    setEvalResult(result);
    setIsSubmitting(false);

    if (passed) {
      soundEngine.correct();
      soundEngine.hapticPulse('normal');
      setStreak(s => s + 1);
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
    } else {
      soundEngine.wrong();
      soundEngine.hapticPulse('strong');
      setStreak(0);
    }
  };

  // 切換玩法（描寫自學版 <-> 實戰默寫版）時強制重開整輪，徹底杜絕描紅分數混入正式排行榜
  const resetRoundForMode = (nextMode) => {
    soundEngine.click();
    if (nextMode === playMode) return;
    setPlayMode(nextMode);
    setQIndex(0);
    setActiveLetterIdx(0);
    setCompletedLetterIndices(new Set());
    setStrokes([]);
    setCurrentStroke(null);
    setActiveStrokeStep(0);
    setTraceMatchesByLetter({});
    setTraceMatchHistory([]);
    letterStrokesRef.current = {};
    setEvalResult(null);
    setIsSubmitting(false);
    setTotalScoreSum(0);
    setScoredCount(0);
    setPassedCount(0);
    setStreak(0);
    setHasUsedTracingInRound(false);
    setSessionStartTime(Date.now());
    setTraceHint(
      nextMode === 'challenge'
        ? '⚔️ 已切換至實戰默寫版並從第 1 題重新計分！'
        : '筆順編號僅供參考，一筆連寫（如 a、d、m）也能直接過關！'
    );
  };

  // 推進至下一題
  const handleNextStep = () => {
    soundEngine.click();
    const scoreVal = typeof evalResult?.score === 'number' ? evalResult.score : (playMode === 'tracing' ? 100 : 0);
    if (playMode === 'tracing') {
      setHasUsedTracingInRound(true);
    }
    setTotalScoreSum(s => s + scoreVal);
    setScoredCount(c => c + 1);
    if (evalResult?.passed !== false) {
      setPassedCount(p => p + 1);
    }

    const nextQIdx = qIndex + 1;
    if (nextQIdx < questions.length) {
      setQIndex(nextQIdx);
      setActiveLetterIdx(0);
      setCompletedLetterIndices(new Set());
      setStrokes([]);
      setCurrentStroke(null);
      setActiveStrokeStep(0);
      setTraceMatchesByLetter({});
      setTraceMatchHistory([]);
      letterStrokesRef.current = {};
      setTraceHint('筆順編號僅供參考，一筆連寫（如 a、d、m）也能直接過關！');
      setEvalResult(null);
    } else {
      // 全數挑戰完成
      const finalTime = Math.max(15, Math.floor((Date.now() - sessionStartTime) / 1000));
      setElapsedTime(finalTime);
      setIsFinished(true);
      soundEngine.win();
      confetti({ particleCount: 80, spread: 80, origin: { y: 0.55 } });
    }
  };

  // ── 結算畫面 ──
  if (isFinished) {
    const avgScore = scoredCount > 0 ? Math.round(totalScoreSum / scoredCount) : 100;
    const finalStars = avgScore >= 80 ? 3 : (avgScore >= 60 ? 2 : 1);
    const isTracingMode = playMode === 'tracing' || hasUsedTracingInRound;

    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4 animate-fadeIn">
        <GlassCard className="max-w-lg w-full text-center p-6 sm:p-8">
          <Trophy className="w-16 h-16 text-amber-500 mx-auto mb-3 animate-bounce" />
          <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 font-heading mb-1">
            {isTracingMode ? '🌱 筆順自學描寫精熟！' : '⚔️ 神筆書寫挑戰完成！'}
          </h2>
          <p className="text-xs font-bold text-slate-500 mb-6">
            挑戰總耗時：<span className="text-emerald-500 font-black text-lg">{elapsedTime} 秒</span>
          </p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">字形筆順精熟度</span>
              <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                {avgScore} 分
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">總評價星級</span>
              <span className="text-3xl font-black text-amber-500">
                {'⭐'.repeat(finalStars)}
              </span>
            </div>
          </div>

          {/* 🌟 核心規則：自學描寫版不登榜，實戰默寫版方可正式上榜與紀錄八星秘典 🌟 */}
          {isTracingMode ? (
            <div className="p-4 mb-6 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700/50 text-left">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-black text-sm mb-1.5">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>🌱 自學描寫練習模式提示</span>
              </div>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300 leading-relaxed">
                恭喜熟練正確筆順與格線！本模式為粗筆螢光描寫之「自學練習」，成績不連動榮譽排行榜。<br />
                若想爭取全校 Top 50 榮譽與點亮八星秘典，請切換至『⚔️ 實戰默寫版』挑戰！
              </p>
            </div>
          ) : (
            <div className="mb-6">
              <HonorSubmissionCard
                gameMode="handwriting"
                book={qualifyingBook || (studentGradeNum === 1 || studentGradeNum === 2 ? 'abc' : '1')}
                score={avgScore}
                correctCount={passedCount}
                time={elapsedTime}
                totalCount={questions.length}
                rangeText={qualifyingBook ? `第 ${qualifyingBook} 冊` : (studentGradeNum === 1 ? '一年級大寫' : '二年級小寫')}
                onSuccess={() => {}}
              />
            </div>
          )}

          <div className="space-y-3">
            <Button3D
              variant="blue"
              size="lg"
              onClick={() => {
                setIsFinished(false);
                setQIndex(0);
                setActiveLetterIdx(0);
                setCompletedLetterIndices(new Set());
                setStrokes([]);
                setTraceMatchesByLetter({});
                setTraceMatchHistory([]);
                letterStrokesRef.current = {};
                setEvalResult(null);
                setTotalScoreSum(0);
                setScoredCount(0);
                setPassedCount(0);
                setStreak(0);
                setHasUsedTracingInRound(false);
                setSessionStartTime(Date.now());
              }}
              className="w-full"
            >
              再練一次
            </Button3D>
            <Button3D variant="slate" size="md" onClick={onBack} className="w-full">
              {t.backLobby}
            </Button3D>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div
      data-handwriting-mode={playMode}
      data-handwriting-qindex={qIndex}
      data-handwriting-scored={scoredCount}
      data-handwriting-char={activeChar}
      className="min-h-[85vh] flex flex-col items-center justify-start p-2 sm:p-4 select-none touch-none"
      style={{
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        overscrollBehavior: 'none'
      }}
    >
      {/* ── 頂部導航列與模式切換 ── */}
      <div className="w-full max-w-4xl flex items-center justify-between gap-2 mb-3">
        <button
          type="button"
          onClick={onBack}
          className="p-2 sm:p-2.5 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:scale-105 active:scale-95 transition-transform shadow-sm cursor-pointer"
          title={t.backLobby}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* 雙模式切換膠囊 [✏️ 描寫自學版 | ⚔️ 實戰默寫版] */}
        <div className="flex bg-slate-200/80 dark:bg-slate-800/90 p-1 rounded-2xl border border-slate-300 dark:border-slate-700 shadow-inner">
          <button
            type="button"
            data-handwriting-mode-btn="tracing"
            onClick={() => resetRoundForMode('tracing')}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              playMode === 'tracing'
                ? 'bg-emerald-600 text-white shadow-md scale-[1.02]'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>✏️ 描寫自學版</span>
            <span className="text-[10px] opacity-80">(螢光引導)</span>
          </button>
          <button
            type="button"
            data-handwriting-mode-btn="challenge"
            onClick={() => resetRoundForMode('challenge')}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              playMode === 'challenge'
                ? 'bg-blue-600 text-white shadow-md scale-[1.02]'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>⚔️ 實戰默寫版</span>
            <span className="text-[10px] opacity-80">(評分登榜)</span>
          </button>
        </div>

        {/* 朗讀發音按鈕 */}
        <button
          type="button"
          onClick={() => speakEnglish(currentQ?.wordStr || activeChar, { persona: 'standard_us' })}
          className="p-2 sm:p-2.5 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-300/40 hover:scale-105 active:scale-95 transition-transform shadow-sm cursor-pointer"
          title="播放標準英語發音"
        >
          <Volume2 className="w-5 h-5" />
        </button>
      </div>

      {/* ── 進度條與題目提示資訊卡 ── */}
      <div className="w-full max-w-4xl mb-2 flex items-center gap-2 px-1">
        <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-sky-400 via-blue-500 to-emerald-400 transition-all duration-500"
            style={{ width: `${Math.round(((qIndex + (evalResult?.passed ? 1 : 0)) / Math.max(1, questions.length)) * 100)}%` }}
          />
        </div>
        {streak >= 2 && (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow animate-pulse shrink-0">
            ✨ {streak} 連星
          </span>
        )}
      </div>

      {/* ── 題目提示資訊卡 ── */}
      <div className="w-full max-w-4xl mb-3 flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 rounded-2xl bg-white/75 dark:bg-slate-800/75 backdrop-blur-md border border-slate-200 dark:border-slate-700/80 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-400/30">
            第 {qIndex + 1} / {questions.length} 題
          </span>
          <span className="text-sm sm:text-base font-black text-slate-800 dark:text-slate-100 font-heading">
            {currentQ?.displayTitle}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-bold hidden sm:inline">
            ({currentQ?.zh})
          </span>
        </div>

        {/* 描寫版建議筆順編號顯示切換 */}
        {playMode === 'tracing' && (
          <button
            type="button"
            onClick={() => {
              soundEngine.click();
              setShowOrderNumbers(v => !v);
            }}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-black border transition-all cursor-pointer ${
              showOrderNumbers
                ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-400/50'
                : 'bg-slate-100 dark:bg-slate-700/70 text-slate-500 dark:text-slate-300 border-slate-300 dark:border-slate-600'
            }`}
          >
            {showOrderNumbers ? '👁️ 顯示建議筆順' : '🙈 隱藏筆順編號'}
          </button>
        )}

        {/* 單字模式下的各字母分頁卡 (s - u - p - e - r - m - a - r - k - e - t) */}
        {isWordMode && (
          <div className="flex items-center gap-1 overflow-x-auto py-0.5 max-w-full">
            {slotList.map((slot) => {
              const isCompleted = completedLetterIndices.has(slot.index);
              const isActive = slot.index === activeLetterIdx;
              return (
                <button
                  key={slot.index}
                  type="button"
                  onClick={() => {
                    soundEngine.click();
                    setActiveLetterIdx(slot.index);
                    setActiveStrokeStep(getFirstUnmatchedStroke(slot.index));
                  }}
                  className={`min-w-6 h-6 px-1.5 rounded-lg font-mono font-black text-xs flex items-center justify-center border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white border-blue-400 scale-110 shadow-sm'
                      : isCompleted
                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-400/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {slot.char}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {playMode === 'tracing' && (
        <div className="w-full max-w-4xl -mt-1 mb-2 px-3 py-2 rounded-xl bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-[11px] sm:text-xs font-bold text-amber-800 dark:text-amber-200">
          ✍️ {traceHint}
        </div>
      )}

      {/* ── 核心四線三格手寫板主舞台 (一二年級單字方形大格，高年級長單字細長自適應長卷) ── */}
      <div
        ref={boardScrollRef}
        className={`relative w-full ${
          isWordMode ? 'max-w-4xl overflow-x-auto scrollbar-thin' : 'max-w-md'
        } rounded-3xl border-4 border-slate-300/80 dark:border-slate-700 bg-amber-50/50 dark:bg-slate-900/90 shadow-2xl backdrop-blur-md p-2 sm:p-3`}
      >
        <div
          style={{
            // 嚴格鎖定繪圖區域 aspect-ratio，保證 SVG 格線與 Canvas 在任何螢幕下 1:1 毫釐不差！
            width: isWordMode ? `${Math.max(360, Math.round(boardWidth * 1.6))}px` : '100%',
            aspectRatio: `${boardWidth} / ${boardHeight}`
          }}
          className="relative mx-auto flex items-center justify-center select-none touch-none overflow-hidden rounded-2xl"
        >
          {/* 1. 四線三格標準教學格線 SVG (preserveAspectRatio="none" 確保與 Canvas 繪圖層 100% 絕對重合) */}
          <svg
            id="four-lines-board-svg"
            viewBox={`0 0 ${boardWidth} ${boardHeight}`}
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full pointer-events-none select-none"
          >
            {/* 四線背景區塊微漸層 */}
            <rect x="0" y="0" width={boardWidth} height="15" fill={isDark ? 'rgba(15, 23, 42, 0.4)' : 'rgba(241, 245, 249, 0.5)'} />
            <rect x="0" y="15" width={boardWidth} height="30" fill={isDark ? 'rgba(30, 41, 59, 0.25)' : 'rgba(255, 255, 255, 0.6)'} />
            <rect x="0" y="45" width={boardWidth} height="30" fill={isDark ? 'rgba(56, 189, 248, 0.05)' : 'rgba(224, 242, 254, 0.35)'} />
            <rect x="0" y="75" width={boardWidth} height="30" fill={isDark ? 'rgba(30, 41, 59, 0.25)' : 'rgba(255, 255, 255, 0.6)'} />
            <rect x="0" y="105" width={boardWidth} height="15" fill={isDark ? 'rgba(15, 23, 42, 0.4)' : 'rgba(241, 245, 249, 0.5)'} />

            {/* 第 1 線：頂線 (Headline / Ascender) */}
            <line x1="0" y1="15" x2={boardWidth} y2="15" stroke={isDark ? '#64748b' : '#94a3b8'} strokeWidth="0.8" />
            <text x="3" y="13" fontSize="3.2" fill={isDark ? '#64748b' : '#94a3b8'} fontWeight="bold">Top (頂線)</text>

            {/* 第 2 線：中線 (Midline / Waistline - 虛線) */}
            <line x1="0" y1="45" x2={boardWidth} y2="45" stroke={isDark ? '#38bdf8' : '#0284c7'} strokeWidth="0.8" strokeDasharray="2, 2" />
            <text x="3" y="43" fontSize="3.2" fill={isDark ? '#38bdf8' : '#0284c7'} fontWeight="bold">Mid (中線)</text>

            {/* 第 3 線：基線 (Baseline - 紅色主基底線) */}
            <line x1="0" y1="75" x2={boardWidth} y2="75" stroke="#f43f5e" strokeWidth="1.2" />
            <text x="3" y="73" fontSize="3.2" fill="#f43f5e" fontWeight="bold">Base (基線)</text>

            {/* 第 4 線：底線 (Descender / Bottom line) */}
            <line x1="0" y1="105" x2={boardWidth} y2="105" stroke={isDark ? '#64748b' : '#94a3b8'} strokeWidth="0.8" />
            <text x="3" y="103" fontSize="3.2" fill={isDark ? '#64748b' : '#94a3b8'} fontWeight="bold">Bottom (底線)</text>

            {/* 長單字模式下的垂直槽位輔助分界線 (讓學生一眼辨別每個字母的位置) */}
            {isWordMode && slotList.map((slot, idx) => (
              <g key={`slot_guide_${idx}`}>
                {idx > 0 && (
                  <line
                    x1={slot.startX}
                    y1="25"
                    x2={slot.startX}
                    y2="95"
                    stroke={isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}
                    strokeWidth="0.8"
                    strokeDasharray="2, 2"
                  />
                )}
                {/* 實戰默寫版底部小標記提示 */}
                {playMode === 'challenge' && (
                  <text
                    x={slot.center}
                    y="114"
                    textAnchor="middle"
                    fill={isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'}
                    fontSize="4"
                    fontFamily="monospace"
                  >
                    {idx + 1}
                  </text>
                )}
              </g>
            ))}

            {/* 🌟 描寫版：粗半透明螢光引導筆劃與 ①②③ 號碼標籤 (所有字母精確呈現在四線三格長卷上) 🌟 */}
            {playMode === 'tracing' && slotList.map((slot) => {
              const model = getLetterStrokes(slot.char);
              if (!model) return null;
              const isLetterCompleted = completedLetterIndices.has(slot.index);
              const isLetterActive = slot.index === activeLetterIdx;
              const matchedStrokeIndices = new Set(traceMatchesByLetter[slot.index] || []);

              return (
                <g
                  key={`letter_group_${slot.index}`}
                  transform={`translate(${slot.center}, 0) scale(${slot.scale}, 1) translate(-50, 0)`}
                >
                  {model.strokes.map((st, sIdx) => {
                    const isStrokeDone = isLetterCompleted || matchedStrokeIndices.has(sIdx);
                    const isCurrentStroke = isLetterActive && !isStrokeDone && sIdx === activeStrokeStep;

                    return (
                      <g key={st.id}>
                        {/* 粗半透明螢光筆跡導引 */}
                        <path
                          d={st.path}
                          fill="none"
                          stroke={
                            isStrokeDone
                              ? '#10b981'
                              : isCurrentStroke
                              ? (isDark ? '#facc15' : '#eab308')
                              : (isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)')
                          }
                          strokeWidth="11"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          opacity={isStrokeDone ? 0.75 : isCurrentStroke ? 0.45 : 0.22}
                        />

                        {/* 筆順圓圈號碼標記 ①②③ (可切換開關，僅在目前活躍的字母上顯示) */}
                        {isLetterActive && showOrderNumbers && (
                          <>
                            <circle
                              cx={st.labelPos.x}
                              cy={st.labelPos.y}
                              r="3.8"
                              fill={isStrokeDone ? '#10b981' : isCurrentStroke ? '#f59e0b' : '#94a3b8'}
                              stroke="#ffffff"
                              strokeWidth="0.8"
                            />
                            <text
                              x={st.labelPos.x}
                              y={st.labelPos.y + 1.3}
                              textAnchor="middle"
                              fill="#ffffff"
                              fontSize="3.8"
                              fontWeight="bold"
                            >
                              {st.id}
                            </text>

                            {/* 當前活躍筆劃起筆指引閃爍小光點 */}
                            {isCurrentStroke && (
                              <circle
                                cx={st.start.x}
                                cy={st.start.y}
                                r="3.2"
                                fill="#3b82f6"
                                className="animate-ping"
                                opacity="0.85"
                              />
                            )}
                          </>
                        )}
                      </g>
                    );
                  })}
                </g>
              );
            })}
          </svg>

          {/* 2. HTML5 繪圖 Canvas (全自適應寬度，支援觸控與滑鼠防滑動手寫) */}
          <canvas
            ref={canvasRef}
            data-handwriting-canvas="true"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onContextMenu={(e) => e.preventDefault()}
            className="absolute inset-0 w-full h-full touch-none select-none cursor-crosshair z-10"
          />
        </div>
      </div>

      {/* ── 底部控制工具列與長單字微調按鈕 ── */}
      <div className="w-full max-w-4xl mt-4 flex items-center justify-between gap-2 px-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleClear}
            className="px-3.5 py-2.5 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:scale-105 active:scale-95 transition-transform flex items-center gap-1.5 text-xs font-black shadow-sm cursor-pointer"
            title="全部清空"
          >
            <RotateCcw className="w-4 h-4 text-rose-500" />
            <span>清空重寫</span>
          </button>
          <button
            type="button"
            onClick={handleUndo}
            disabled={strokes.length === 0}
            className="p-2.5 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:scale-105 active:scale-95 transition-transform disabled:opacity-40 disabled:pointer-events-none shadow-sm cursor-pointer"
            title="撤銷上一筆"
          >
            <Undo2 className="w-4 h-4" />
          </button>

          {/* 長單字左右導航微調小按鈕 (手機視窗特別便利) */}
          {isWordMode && (
            <div className="flex items-center gap-1 ml-1 sm:hidden">
              <button
                type="button"
                onClick={() => {
                  if (activeLetterIdx > 0) {
                    const nextIndex = activeLetterIdx - 1;
                    setActiveLetterIdx(nextIndex);
                    setActiveStrokeStep(getFirstUnmatchedStroke(nextIndex));
                  }
                }}
                disabled={activeLetterIdx === 0}
                className="p-2 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (activeLetterIdx + 1 < slotList.length) {
                    const nextIndex = activeLetterIdx + 1;
                    setActiveLetterIdx(nextIndex);
                    setActiveStrokeStep(getFirstUnmatchedStroke(nextIndex));
                  }
                }}
                disabled={activeLetterIdx + 1 >= slotList.length}
                className="p-2 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {playMode === 'tracing' ? (
          <Button3D
            variant="emerald"
            size="md"
            onClick={handleNextStep}
            disabled={!evalResult?.passed && completedLetterIndices.size < (isWordMode ? slotList.length : 1)}
            icon={ArrowRight}
          >
            完成進入下一題
          </Button3D>
        ) : (
          <Button3D
            variant="blue"
            size="md"
            onClick={handleEvaluateChallenge}
            disabled={strokes.length === 0 || evalResult !== null}
            icon={Check}
          >
            提交判定
          </Button3D>
        )}
      </div>

      {/* ── 實戰模式評分正誤遮罩彈窗 (獨立 fixed 浮層，徹底脫離四線三格容器，杜絕被裁剪) ── */}
      {evalResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn select-none">
          <div className="w-full max-w-sm max-h-[90vh] overflow-y-auto p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-800 shadow-2xl text-center border-2 border-slate-200 dark:border-slate-700 animate-scaleUp">
            <div className="text-4xl sm:text-5xl mb-2">
              {evalResult.passed ? '🎉' : '💪'}
            </div>
            <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-1">
              {evalResult.passed ? `${evalResult.score} 分 • 完美書寫！` : `${evalResult.score} 分 • 再試一次`}
            </h3>
            <div className="flex justify-center gap-1 text-2xl mb-2">
              {'⭐'.repeat(evalResult.stars)}
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
              {evalResult.feedback}
            </p>

            {/* 單字模式各字母評分分佈 */}
            {evalResult.letterScores && (
              <div className="flex justify-center gap-1.5 mb-4 flex-wrap">
                {evalResult.letterScores.map((ls, idx) => (
                  <span
                    key={idx}
                    className={`px-2 py-0.5 rounded-lg text-xs font-mono font-black border ${
                      ls.passed
                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-400/40'
                        : 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-400/40'
                    }`}
                  >
                    {ls.char} ({ls.score})
                  </span>
                ))}
              </div>
            )}

            <div className="flex gap-2.5 mt-2">
              <Button3D
                variant="slate"
                size="md"
                onClick={handleClear}
                className="flex-1"
              >
                重新書寫
              </Button3D>
              {evalResult.passed && (
                <Button3D
                  variant="emerald"
                  size="md"
                  onClick={handleNextStep}
                  className="flex-1"
                  icon={ArrowRight}
                >
                  下一題
                </Button3D>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
