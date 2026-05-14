import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../shared/widgets/app_button.dart';
import '../../shared/widgets/app_text_field.dart';
import 'auth_state.dart';
import '../home/role_entry_screen.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _email = TextEditingController();
  final _pass = TextEditingController();
  var _busy = false;
  String? _err;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Sign in')),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            AppTextField(controller: _email, label: 'Email', keyboardType: TextInputType.emailAddress),
            const SizedBox(height: 12),
            AppTextField(controller: _pass, label: 'Password', obscure: true),
            if (_err != null) ...[const SizedBox(height: 8), Text(_err!, style: const TextStyle(color: Colors.red))],
            const Spacer(),
            AppButton(
              label: 'Login',
              loading: _busy,
              onPressed: () async {
                setState(() {
                  _busy = true;
                  _err = null;
                });
                try {
                  await ref.read(authStateProvider.notifier).login(_email.text.trim(), _pass.text);
                  if (context.mounted) {
                    Navigator.of(context).pushReplacement(MaterialPageRoute<void>(builder: (_) => const RoleEntryScreen()));
                  }
                } catch (e) {
                  setState(() => _err = e.toString());
                } finally {
                  if (mounted) setState(() => _busy = false);
                }
              },
            ),
            TextButton(
              onPressed: () => Navigator.of(context).push(MaterialPageRoute<void>(builder: (_) => const RegisterScreen())),
              child: const Text('Create account'),
            ),
          ],
        ),
      ),
    );
  }
}

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _email = TextEditingController();
  final _user = TextEditingController();
  final _name = TextEditingController();
  final _pass = TextEditingController();
  var _busy = false;
  String? _err;
  String _role = 'seller';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Register')),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          AppTextField(controller: _email, label: 'Email', keyboardType: TextInputType.emailAddress),
          const SizedBox(height: 12),
          AppTextField(controller: _user, label: 'Username'),
          const SizedBox(height: 12),
          AppTextField(controller: _name, label: 'Full name'),
          const SizedBox(height: 12),
          AppTextField(controller: _pass, label: 'Password', obscure: true),
          const SizedBox(height: 12),
          DropdownButtonFormField<String>(
            value: _role,
            decoration: const InputDecoration(labelText: 'Role'),
            items: const [
              DropdownMenuItem(value: 'seller', child: Text('Seller')),
              DropdownMenuItem(value: 'buyer', child: Text('Buyer')),
            ],
            onChanged: (v) => setState(() => _role = v ?? 'seller'),
          ),
          if (_err != null) ...[const SizedBox(height: 8), Text(_err!, style: const TextStyle(color: Colors.red))],
          const SizedBox(height: 20),
          AppButton(
            label: 'Register',
            loading: _busy,
            onPressed: () async {
              setState(() {
                _busy = true;
                _err = null;
              });
              try {
                await ref.read(authStateProvider.notifier).register({
                  'email': _email.text.trim(),
                  'username': _user.text.trim(),
                  'full_name': _name.text.trim(),
                  'password': _pass.text,
                  'role': _role,
                });
                if (context.mounted) {
                  Navigator.of(context).pushAndRemoveUntil(
                    MaterialPageRoute<void>(builder: (_) => const RoleEntryScreen()),
                    (route) => false,
                  );
                }
              } catch (e) {
                setState(() => _err = e.toString());
              } finally {
                if (mounted) setState(() => _busy = false);
              }
            },
          ),
        ],
      ),
    );
  }
}
