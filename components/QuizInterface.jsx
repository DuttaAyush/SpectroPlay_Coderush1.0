import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Check, X, Clock, ChevronRight } from 'lucide-react-native';

const AnswerOption = ({
  option,
  index,
  isSelected,
  isCorrect,
  isIncorrect,
  onSelect,
  showResult,
}) => {
  const getOptionStyle = () => {
    if (showResult) {
      if (isCorrect) return [styles.answerOption, styles.correctOption];
      if (isIncorrect) return [styles.answerOption, styles.incorrectOption];
    }
    if (isSelected) return [styles.answerOption, styles.selectedOption];
    return styles.answerOption;
  };

  const getOptionIcon = () => {
    if (showResult && isCorrect) return <Check size={20} color="#10B981" />;
    if (showResult && isIncorrect) return <X size={20} color="#EF4444" />;
    return null;
  };

  return (
    <TouchableOpacity
      style={getOptionStyle()}
      onPress={onSelect}
      activeOpacity={0.8}
      disabled={showResult}
    >
      <View style={styles.optionContent}>
        <View style={styles.optionIndex}>
          <Text style={styles.optionIndexText}>{String.fromCharCode(65 + index)}</Text>
        </View>
        <Text style={[
          styles.optionText,
          isSelected && styles.selectedOptionText,
          showResult && isCorrect && styles.correctOptionText,
          showResult && isIncorrect && styles.incorrectOptionText,
        ]}>
          {option}
        </Text>
        {getOptionIcon()}
      </View>
    </TouchableOpacity>
  );
};

const SliderQuestion = ({
  value,
  min,
  max,
  step,
  unit = '',
  onChange,
  showResult,
  correctAnswer,
}) => {
  const percentage = ((value - min) / (max - min)) * 100;
  
  return (
    <View style={styles.sliderContainer}>
      <View style={styles.sliderHeader}>
        <Text style={styles.sliderValue}>
          {value}{unit}
        </Text>
        {showResult && correctAnswer !== undefined && (
          <Text style={[
            styles.correctValue,
            Math.abs(value - correctAnswer) <= step && styles.correctValueSuccess
          ]}>
            Correct: {correctAnswer}{unit}
          </Text>
        )}
      </View>
      
      <View style={styles.sliderTrack}>
        <View style={[styles.sliderFill, { width: `${percentage}%` }]} />
        <View style={[styles.sliderThumb, { left: `${Math.max(0, Math.min(100, percentage))}%` }]} />
      </View>
      
      <View style={styles.sliderLabels}>
        <Text style={styles.sliderLabel}>{min}{unit}</Text>
        <Text style={styles.sliderLabel}>{max}{unit}</Text>
      </View>
    </View>
  );
};

export const QuizInterface = ({
  questions,
  onClose,
  onComplete,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  // Timer effect
  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleQuizComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answer) => {
    setAnswers({ ...answers, [currentQuestion.id]: answer });
    setShowResult(true);
    
    // Auto-advance after showing result
    setTimeout(() => {
      if (isLastQuestion) {
        handleQuizComplete();
      } else {
        handleNextQuestion();
      }
    }, 1500);
  };

  const handleNextQuestion = () => {
    setShowResult(false);
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  };

  const handleQuizComplete = () => {
    const score = calculateScore();
    onComplete(score);
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((question) => {
      const userAnswer = answers[question.id];
      if (question.correctAnswer === userAnswer) {
        correct++;
      } else if (question.type === 'slider' && question.correctAnswer !== undefined) {
        const tolerance = question.sliderRange?.step || 1;
        if (Math.abs(userAnswer - question.correctAnswer) <= tolerance) {
          correct++;
        }
      }
    });
    return Math.round((correct / questions.length) * 100);
  };

  const renderQuestion = () => {
    switch (currentQuestion.type) {
      case 'multiple-choice':
        return (
          <View style={styles.optionsContainer}>
            {currentQuestion.options?.map((option, index) => (
              <AnswerOption
                key={index}
                option={option}
                index={index}
                isSelected={answers[currentQuestion.id] === option}
                isCorrect={showResult && option === currentQuestion.correctAnswer}
                isIncorrect={showResult && answers[currentQuestion.id] === option && option !== currentQuestion.correctAnswer}
                onSelect={() => !showResult && handleAnswerSelect(option)}
                showResult={showResult}
              />
            ))}
          </View>
        );

      case 'slider':
        return (
          <SliderQuestion
            value={answers[currentQuestion.id] || currentQuestion.sliderRange?.min || 0}
            min={currentQuestion.sliderRange?.min || 0}
            max={currentQuestion.sliderRange?.max || 100}
            step={currentQuestion.sliderRange?.step || 1}
            unit={currentQuestion.unit}
            onChange={(value) => setAnswers({ ...answers, [currentQuestion.id]: value })}
            showResult={showResult}
            correctAnswer={currentQuestion.correctAnswer}
          />
        );

      case 'text-input':
        return (
          <View style={styles.textInputContainer}>
            <TextInput
              style={styles.textInput}
              value={answers[currentQuestion.id] || ''}
              onChangeText={(text) => setAnswers({ ...answers, [currentQuestion.id]: text })}
              placeholder="Type your answer here..."
              placeholderTextColor="#6B7280"
              multiline
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[styles.submitButton, !answers[currentQuestion.id] && styles.disabledButton]}
              onPress={() => handleAnswerSelect(answers[currentQuestion.id])}
              disabled={!answers[currentQuestion.id] || showResult}
            >
              <Text style={styles.submitButtonText}>Submit Answer</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#0A0B1A', '#1F2937']}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={onClose}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quiz</Text>
          <View style={styles.timerContainer}>
            <Clock size={16} color="#F59E0B" />
            <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
          </View>
        </View>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {currentQuestionIndex + 1} of {questions.length}
          </Text>
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
          {renderQuestion()}
        </View>

        {/* Navigation */}
        {showResult && (
          <View style={styles.navigationContainer}>
            <TouchableOpacity
              style={styles.nextButton}
              onPress={isLastQuestion ? handleQuizComplete : handleNextQuestion}
            >
              <Text style={styles.nextButtonText}>
                {isLastQuestion ? 'Complete Quiz' : 'Next Question'}
              </Text>
              <ChevronRight size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0B1A',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
    minWidth: 60,
    textAlign: 'right',
  },
  content: {
    flex: 1,
  },
  questionContainer: {
    padding: 20,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 26,
    marginBottom: 32,
  },
  optionsContainer: {
    gap: 12,
  },
  answerOption: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#374151',
  },
  selectedOption: {
    borderColor: '#3B82F6',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  correctOption: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  incorrectOption: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  optionIndex: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIndexText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D1D5DB',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#D1D5DB',
    lineHeight: 22,
  },
  selectedOptionText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  correctOptionText: {
    color: '#10B981',
    fontWeight: '600',
  },
  incorrectOptionText: {
    color: '#EF4444',
    fontWeight: '600',
  },
  sliderContainer: {
    marginTop: 20,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sliderValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3B82F6',
  },
  correctValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
  correctValueSuccess: {
    color: '#10B981',
  },
  sliderTrack: {
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
    position: 'relative',
    marginBottom: 16,
  },
  sliderFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  sliderThumb: {
    position: 'absolute',
    top: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    marginLeft: -12,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  textInputContainer: {
    gap: 20,
  },
  textInput: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#374151',
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    minHeight: 120,
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  disabledButton: {
    backgroundColor: '#4B5563',
    opacity: 0.5,
  },
  navigationContainer: {
    padding: 20,
  },
  nextButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});