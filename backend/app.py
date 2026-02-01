"""
Enhanced Flask API with all premium features
"""
import os
import difflib
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from ai_service import ai_service
from database_service import db_service
from document_service import document_service
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
        'version': '2.0.0',
        'features': [
            'self-learning',
            'confidence-scoring',
            'sentiment-analysis',
            'conversation-history',
            'performance-metrics',
            'document-upload'
        ]
    })

@app.route('/', methods=['GET'])
def home():
    """API documentation"""
    return jsonify({
        'service': 'Issa Compass AI Assistant v2.0',
        'endpoints': {
            'POST /generate-reply': 'Generate AI response with analytics',
            'POST /improve-ai': 'Auto-improve AI',
            'POST /improve-ai-manual': 'Manual improvement',
            'GET /get-prompt': 'Get current prompt',
            'GET /test-training': 'Test on sample data',
            'GET /analytics': 'Get improvement analytics',
            'GET /conversations': 'Get conversation history',
            'POST /conversations/search': 'Search conversations',
            'GET /performance': 'Get performance metrics',
            'GET /prompt-diff': 'Get prompt differences',
            'POST /upload-document': 'Upload and analyze document',
            'GET /health': 'Health check'
        }
    })

@app.route('/generate-reply', methods=['POST'])
def generate_reply():
    """Generate AI response with analytics"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data'}), 400
        
        client_sequence = data.get('clientSequence')
        chat_history = data.get('chatHistory', [])
        provider = data.get('provider')
        include_analytics = data.get('includeAnalytics', True)
        
        if not client_sequence:
            return jsonify({'error': 'clientSequence required'}), 400
        
        if isinstance(client_sequence, str):
            client_sequence = [client_sequence]
        
        result = ai_service.generate_reply(
            client_sequence=client_sequence,
            chat_history=chat_history,
            provider=provider,
            include_analytics=include_analytics
        )
        
        return jsonify({
            'aiReply': result['reply'],
            'responseTime': result.get('response_time'),
            'sentiment': result.get('sentiment'),
            'confidence': result.get('confidence'),
            'provider': provider or os.getenv('DEFAULT_LLM_PROVIDER', 'claude')
        })
    except Exception as e:
        print(f"Error: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/improve-ai', methods=['POST'])
def improve_ai():
    """Auto-improve AI with diff tracking"""
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
            'updatedPrompt': result['updated_prompt'],
            'oldPrompt': result['old_prompt'],
            'newPrompt': result['new_prompt']
        })
    except Exception as e:
        print(f"Error: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/improve-ai-manual', methods=['POST'])
def improve_ai_manual():
    """Manual improvement with diff"""
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
            'updatedPrompt': result['updated_prompt'],
            'oldPrompt': result['old_prompt'],
            'newPrompt': result['new_prompt']
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
            'improvement_history': history[-10:]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# NEW: Conversation History Endpoints
@app.route('/conversations', methods=['GET'])
def get_conversations():
    """Get conversation history with pagination"""
    try:
        limit = int(request.args.get('limit', 50))
        offset = int(request.args.get('offset', 0))
        
        conversations = db_service.get_conversations(limit, offset)
        total = len(db_service.storage['conversations'])
        
        return jsonify({
            'conversations': conversations,
            'total': total,
            'limit': limit,
            'offset': offset
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/conversations/search', methods=['POST'])
def search_conversations():
    """Search conversations"""
    try:
        data = request.get_json()
        query = data.get('query', '')
        
        results = db_service.search_conversations(query)
        
        return jsonify({
            'results': results,
            'count': len(results),
            'query': query
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/conversations/export', methods=['GET'])
def export_conversations():
    """Export conversations as CSV"""
    try:
        import csv
        from io import StringIO
        
        conversations = db_service.get_conversations(limit=1000)
        
        output = StringIO()
        writer = csv.DictWriter(output, fieldnames=['id', 'timestamp', 'client_message', 'ai_reply', 'sentiment', 'confidence'])
        writer.writeheader()
        
        for conv in conversations:
            writer.writerow({
                'id': conv.get('id'),
                'timestamp': conv.get('timestamp'),
                'client_message': conv.get('client_message'),
                'ai_reply': conv.get('ai_reply'),
                'sentiment': conv.get('sentiment', {}).get('sentiment', 'N/A'),
                'confidence': conv.get('confidence', {}).get('score', 'N/A')
            })
        
        return output.getvalue(), 200, {
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename=conversations.csv'
        }
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# NEW: Performance Metrics Endpoints
@app.route('/performance', methods=['GET'])
def performance_metrics():
    """Get performance metrics"""
    try:
        limit = int(request.args.get('limit', 100))
        
        metrics = db_service.get_performance_metrics(limit)
        summary = db_service.get_performance_summary()
        
        return jsonify({
            'summary': summary,
            'recent_metrics': metrics[-20:],
            'total_data_points': len(metrics)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# NEW: Diff Viewer Endpoint
@app.route('/prompt-diff', methods=['GET'])
def prompt_diff():
    """Get diff between prompt versions"""
    try:
        version = request.args.get('version', type=int)
        
        history = db_service.get_improvement_history()
        current_prompt = db_service.get_prompt()
        
        if version is None:
            # Get diff between latest two versions
            if len(history) > 0:
                old_prompt = history[-1]['prompt']
            else:
                old_prompt = current_prompt
            new_prompt = current_prompt
        else:
            # Get specific version
            if version < 1 or version > len(history) + 1:
                return jsonify({'error': 'Invalid version'}), 400
            
            if version == len(history) + 1:
                new_prompt = current_prompt
                old_prompt = history[-1]['prompt'] if history else current_prompt
            else:
                new_prompt = history[version]['prompt'] if version < len(history) else current_prompt
                old_prompt = history[version - 1]['prompt'] if version > 0 else history[0]['prompt']
        
        # Generate diff
        diff = list(difflib.unified_diff(
            old_prompt.splitlines(keepends=True),
            new_prompt.splitlines(keepends=True),
            lineterm='',
            fromfile='old_prompt',
            tofile='new_prompt'
        ))
        
        return jsonify({
            'old_prompt': old_prompt,
            'new_prompt': new_prompt,
            'diff': ''.join(diff),
            'version': version or len(history) + 1
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# NEW: Document Upload Endpoint
@app.route('/upload-document', methods=['POST'])
def upload_document():
    """Upload and analyze document"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Read file
        file_content = file.read()
        filename = file.filename
        file_type = file.content_type
        
        # Analyze document
        analysis = document_service.analyze_document(file_content, filename, file_type)
        
        # Save metadata
        doc_metadata = {
            'filename': filename,
            'file_type': file_type,
            'size': len(file_content),
            'analysis': analysis
        }
        
        saved_doc = db_service.save_document(doc_metadata)
        
        return jsonify({
            'success': True,
            'document_id': saved_doc['id'],
            'filename': filename,
            'analysis': analysis
        })
    except Exception as e:
        print(f"Error: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/documents', methods=['GET'])
def get_documents():
    """Get uploaded documents"""
    try:
        documents = db_service.get_documents()
        return jsonify({
            'documents': documents,
            'count': len(documents)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)