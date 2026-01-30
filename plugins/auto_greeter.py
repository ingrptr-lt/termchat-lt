# Example Plugin: Auto Greeter
# This plugin automatically greets new users when they join

def handle_trigger(trigger_type, data):
    """Handle plugin triggers"""
    if trigger_type == 'user_join':
        user_id = data.get('user_id', 'Unknown')
        return {
            'action': 'send_message',
            'message': f'Welcome to TermOS LT, {user_id}! 🎉 Type /help to get started.',
            'target': 'all'
        }
    elif trigger_type == 'message':
        message = data.get('message', '').lower()
        if 'hello' in message or 'hi' in message:
            return {
                'action': 'send_message', 
                'message': 'Hello there! Nice to meet you! 👋',
                'target': data.get('user_id')
            }
    
    return None

def main(input_data):
    """Main function for Docker execution"""
    return handle_trigger(input_data.get('trigger'), input_data.get('data', {}))
