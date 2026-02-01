"""
Document Upload and Analysis Service
"""
import os
import io
import base64
from typing import Dict
from PIL import Image
import PyPDF2

class DocumentService:
    
    def analyze_document(self, file_content: bytes, filename: str, file_type: str) -> Dict:
        """Analyze uploaded document"""
        
        if file_type == 'application/pdf':
            return self._analyze_pdf(file_content)
        elif file_type.startswith('image/'):
            return self._analyze_image(file_content)
        else:
            return {
                'error': 'Unsupported file type',
                'supported_types': ['PDF', 'PNG', 'JPG', 'JPEG']
            }
    
    def _analyze_pdf(self, file_content: bytes) -> Dict:
        """Extract and analyze PDF content"""
        try:
            pdf_file = io.BytesIO(file_content)
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            
            num_pages = len(pdf_reader.pages)
            text_content = ""
            
            for page in pdf_reader.pages:
                text_content += page.extract_text()
            
            # Analyze for bank statement
            analysis = self._analyze_bank_statement(text_content)
            
            return {
                'type': 'pdf',
                'pages': num_pages,
                'text_length': len(text_content),
                'analysis': analysis,
                'preview': text_content[:500]  # First 500 chars
            }
        except Exception as e:
            return {
                'error': str(e),
                'type': 'pdf'
            }
    
    def _analyze_image(self, file_content: bytes) -> Dict:
        """Analyze image"""
        try:
            image = Image.open(io.BytesIO(file_content))
            
            return {
                'type': 'image',
                'format': image.format,
                'size': image.size,
                'mode': image.mode,
                'message': 'Image uploaded successfully. Use OCR for text extraction.'
            }
        except Exception as e:
            return {
                'error': str(e),
                'type': 'image'
            }
    
    def _analyze_bank_statement(self, text: str) -> Dict:
        """Analyze bank statement text"""
        text_lower = text.lower()
        
        # Look for key indicators
        has_balance = 'balance' in text_lower or 'available' in text_lower
        has_dates = any(month in text_lower for month in ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'])
        has_account = 'account' in text_lower
        
        # Try to extract numbers (potential balances)
        import re
        numbers = re.findall(r'\$?[\d,]+\.?\d*', text)
        large_numbers = [n for n in numbers if len(n.replace(',', '').replace('.', '')) >= 4]
        
        checks = {
            'appears_to_be_bank_statement': has_balance and has_dates and has_account,
            'has_balance_field': has_balance,
            'has_date_information': has_dates,
            'has_account_number': has_account,
            'potential_balances': large_numbers[:5] if large_numbers else []
        }
        
        # Recommendations
        recommendations = []
        if not checks['appears_to_be_bank_statement']:
            recommendations.append("⚠️ This may not be a bank statement")
        if not checks['has_balance_field']:
            recommendations.append("⚠️ No clear balance information found")
        if not checks['has_date_information']:
            recommendations.append("⚠️ No date information found - need 3-month period")
        
        if checks['appears_to_be_bank_statement']:
            recommendations.append("✅ Looks like a valid bank statement")
            recommendations.append("ℹ️ Please verify balance meets 500,000 THB requirement")
            recommendations.append("ℹ️ Ensure statement covers 3-month period")
        
        return {
            'checks': checks,
            'recommendations': recommendations,
            'confidence': 'high' if checks['appears_to_be_bank_statement'] else 'low'
        }

# Singleton
document_service = DocumentService()