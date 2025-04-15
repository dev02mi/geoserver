import React from 'react';
import { Form } from 'react-bootstrap';

const SecurityQuestionPair = ({
    label,
    questionName,
    answerName,
    questions,
    selectedQuestions,
    value,
    onChange,
    answerValue,
    onBlur,
    error,
    maxLength,
    placeholder,
}) => (
    <div className="form-group " style={{
        display: 'flex', marginLeft: '16px',
        justifyContent: 'left', gap: '35px', 
    }}>
        <div>
            <Form.Label htmlFor={questionName} className="lable2">
                <span className="required-field">*</span>
                {label}:
                <span className="error-message">{error}</span>
            </Form.Label>
            <Form.Control
                style={{ padding: '0px', width: '251px', fontSize: '12px' }}
                className="p"
                as="select"
                id={questionName}
                name={questionName}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
            >
                <option value="" disabled selected>
                    Select Question
                </option>
                {questions
                    .filter((question) => !selectedQuestions.includes(question.id))
                    .map((question) => (
                        <option key={question.id} value={question.id}>
                            {question.text}
                        </option>
                    ))}
            </Form.Control>
        </div>
        <div>
            <Form.Label htmlFor={answerName} className="lable2">
                <span className="required-field">*</span>
                Your Answer:
                <span className="error-message">{error}</span>
            </Form.Label>
            <Form.Control
                style={{ padding: '0px', width: '251px', fontSize: '12px' }}
                type="text"
                id={answerName}
                name={answerName}
                value={answerValue} 
                onChange={onChange}
                onBlur={onBlur}
                autoComplete="off"
                placeholder={placeholder}
                maxLength={maxLength}
            />
        </div>

    </div>


);

export default SecurityQuestionPair;
