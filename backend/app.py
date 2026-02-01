import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from ai_service import ai_service
from database_service import db_service
from data_processor import load_conversations, extract_sequences
import traceback

load_dotenv()

app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
def health():
    """Health check"""
    return jsonify({
        'status': 'healthy',
        'service': 'Issa Compass AI Assistant',
        'version': '1.0.0'
    })

@app.route('/', methods=['GET'])
def home():
    """API documentation"""
    return jsonify({
        'service': 'Issa Compass AI Assistant',
        'endpoints': {
            'POST /generate-reply': 'Generate AI response',
            'POST /improve-ai': 'Auto-improve AI',
            'POST /improve-ai-manual': 'Manual improvement',
            'GET /get-prompt': 'Get current prompt',
            'GET /test-training': 'Test on sample data',
            'GET /analytics': 'Get improvement analytics',
            'GET /health': 'Health check'
        }
    })

@app.route('/generate-reply', methods=['POST'])
def generate_reply():
    """Generate AI response"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data'}), 400
        
        client_sequence = data.get('clientSequence')
        chat_history = data.get('chatHistory', [])
        provider = data.get('provider')
        
        if not client_sequence:
            return jsonify({'error': 'clientSequence required'}), 400
        
        if isinstance(client_sequence, str):
            client_sequence = [client_sequence]
        
        ai_reply = ai_service.generate_reply(client_sequence, chat_history, provider)
        
        return jsonify({
            'aiReply': ai_reply,
            'provider': provider or os.getenv('DEFAULT_LLM_PROVIDER', 'claude')
        })
    except Exception as e:
        print(f"Error: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/improve-ai', methods=['POST'])
def improve_ai():
    """Auto-improve AI"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data'}), 400
        
        client_sequence = data.get('clientSequence')
        chat_history = data.get('chatHistory', [])
        consultant_reply = data.get('consultantReply')
        provider = data.get('provider')
        
        if not client_sequence or not consultant_reply:
            return jsonify({'error': 'clientSequence and consultantReply required'}), 400
        
        if isinstance(client_sequence, str):
            client_sequence = [client_sequence]
        if isinstance(consultant_reply, str):
            consultant_reply = [consultant_reply]
        
        result = ai_service.improve_prompt_auto(
            client_sequence, chat_history, consultant_reply, provider
        )
        
        return jsonify({
            'predictedReply': result['predicted_reply'],
            'actualReply': result['actual_reply'],
            'analysis': result['analysis'],
            'changesMade': result['changes_made'],
            'updatedPrompt': result['updated_prompt']
        })
    except Exception as e:
        print(f"Error: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/improve-ai-manual', methods=['POST'])
def improve_ai_manual():
    """Manual improvement"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data'}), 400
        
        instructions = data.get('instructions')
        provider = data.get('provider')
        
        if not instructions:
            return jsonify({'error': 'instructions required'}), 400
        
        result = ai_service.improve_prompt_manual(instructions, provider)
        
        return jsonify({
            'explanation': result['explanation'],
            'updatedPrompt': result['updated_prompt']
        })
    except Exception as e:
        print(f"Error: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/get-prompt', methods=['GET'])
def get_prompt():
    """Get current prompt"""
    try:
        current_prompt = db_service.get_prompt()
        return jsonify({'prompt': current_prompt})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/test-training', methods=['GET'])
def test_training():
    """Test training on sample data"""
    try:
        conversations = load_conversations('conversations.json')
        sequences = extract_sequences(conversations)
        
        if len(sequences) == 0:
            return jsonify({'error': 'No sequences found'}), 400
        
        results = []
        for i, seq in enumerate(sequences[:3]):
            try:
                result = ai_service.improve_prompt_auto(
                    seq['client_sequence'],
                    seq['chat_history'],
                    seq['consultant_reply']
                )
                
                results.append({
                    'sequence_num': i + 1,
                    'contact_id': seq['contact_id'],
                    'scenario': seq['scenario'],
                    'predicted_reply': result['predicted_reply'],
                    'actual_reply': result['actual_reply'],
                    'analysis': result['analysis']
                })
            except Exception as e:
                results.append({'sequence_num': i + 1, 'error': str(e)})
        
        return jsonify({
            'message': 'Training completed on 3 sequences',
            'total_sequences_available': len(sequences),
            'results': results
        })
    except Exception as e:
        print(f"Error: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/analytics', methods=['GET'])
def analytics():
    """Get improvement analytics"""
    try:
        history = db_service.get_improvement_history()
        current_version = db_service.storage['version']
        
        return jsonify({
            'current_version': current_version,
            'total_improvements': len(history),
            'improvement_history': history[-10:]  # Last 10
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)