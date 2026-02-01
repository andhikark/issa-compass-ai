import json
from typing import List, Dict

def load_conversations(filepath: str) -> List[Dict]:
    """Load conversations from JSON file"""
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def extract_sequences(conversations: List[Dict]) -> List[Dict]:
    """
    Extract all client sequences with their consultant replies and chat history.
    """
    sequences = []
    
    for convo in conversations:
        contact_id = convo.get('contact_id')
        scenario = convo.get('scenario')
        messages = convo.get('conversation', [])
        
        chat_history = []
        client_buffer = []
        
        for i, msg in enumerate(messages):
            if msg['direction'] == 'in':
                # Client message
                client_buffer.append(msg['text'])
            else:
                # Consultant message
                if client_buffer:
                    # Collect all consecutive consultant messages
                    consultant_reply = [msg['text']]
                    j = i + 1
                    while j < len(messages) and messages[j]['direction'] == 'out':
                        consultant_reply.append(messages[j]['text'])
                        j += 1
                    
                    # Create sequence entry
                    sequences.append({
                        'contact_id': contact_id,
                        'scenario': scenario,
                        'client_sequence': client_buffer.copy(),
                        'consultant_reply': consultant_reply,
                        'chat_history': chat_history.copy()
                    })
                    
                    # Update chat history
                    for client_msg in client_buffer:
                        chat_history.append({'role': 'client', 'message': client_msg})
                    for consultant_msg in consultant_reply:
                        chat_history.append({'role': 'consultant', 'message': consultant_msg})
                    
                    client_buffer = []
                else:
                    chat_history.append({'role': 'consultant', 'message': msg['text']})
    
    return sequences

def format_sequence_for_display(sequence: Dict) -> str:
    """Format a sequence nicely for display"""
    output = []
    output.append(f"=== Contact: {sequence['contact_id']} ===")
    output.append(f"Scenario: {sequence['scenario']}")
    output.append("\nCHAT HISTORY:")
    
    if sequence['chat_history']:
        for msg in sequence['chat_history']:
            role = msg['role'].upper()
            output.append(f"  [{role}] {msg['message']}")
    else:
        output.append("  (No previous history)")
    
    output.append("\nCLIENT SEQUENCE:")
    for msg in sequence['client_sequence']:
        output.append(f"  {msg}")
    
    output.append("\nCONSULTANT REPLY:")
    for msg in sequence['consultant_reply']:
        output.append(f"  {msg}")
    
    output.append("\n" + "="*60 + "\n")
    return "\n".join(output)

if __name__ == "__main__":
    conversations = load_conversations('conversations.json')
    sequences = extract_sequences(conversations)
    
    print(f"Total conversations: {len(conversations)}")
    print(f"Total sequences extracted: {len(sequences)}")
    print("\nSample sequences:\n")
    
    for i, seq in enumerate(sequences[:3]):
        print(format_sequence_for_display(seq))