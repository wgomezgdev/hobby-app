import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:hobby_app/core/database/database_provider.dart';
import 'package:hobby_app/features/auth/presentation/providers/auth_providers.dart';
import 'package:hobby_app/features/library/domain/models/book.dart';
import 'package:uuid/uuid.dart';

class AddBookScreen extends ConsumerStatefulWidget {
  const AddBookScreen({super.key});

  @override
  ConsumerState<AddBookScreen> createState() => _AddBookScreenState();
}

class _AddBookScreenState extends ConsumerState<AddBookScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _authorController = TextEditingController();
  final _pagesController = TextEditingController();
  var _status = BookStatus.wantToRead;
  var _saving = false;

  @override
  void dispose() {
    _titleController.dispose();
    _authorController.dispose();
    _pagesController.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);
    final userId = ref.read(currentUserProvider)?.id ?? '';
    final now = DateTime.now().toUtc();
    final book = Book(
      id: const Uuid().v4(),
      userId: userId,
      title: _titleController.text.trim(),
      author: _authorController.text.trim(),
      totalPages: int.parse(_pagesController.text),
      status: _status,
      createdAt: now,
      updatedAt: now,
    );
    await ref.read(bookRepositoryProvider).save(book);
    if (mounted) context.pop();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Add Book'),
        actions: [
          TextButton(
            onPressed: _saving ? null : _save,
            child: const Text('Save'),
          ),
        ],
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            TextFormField(
              controller: _titleController,
              decoration: const InputDecoration(
                labelText: 'Title',
                border: OutlineInputBorder(),
              ),
              textCapitalization: TextCapitalization.sentences,
              validator: (v) =>
                  (v == null || v.trim().isEmpty) ? 'Required' : null,
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _authorController,
              decoration: const InputDecoration(
                labelText: 'Author',
                border: OutlineInputBorder(),
              ),
              textCapitalization: TextCapitalization.words,
              validator: (v) =>
                  (v == null || v.trim().isEmpty) ? 'Required' : null,
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _pagesController,
              decoration: const InputDecoration(
                labelText: 'Total pages',
                border: OutlineInputBorder(),
              ),
              keyboardType: TextInputType.number,
              inputFormatters: [FilteringTextInputFormatter.digitsOnly],
              validator: (v) {
                if (v == null || v.isEmpty) return 'Required';
                final n = int.tryParse(v);
                if (n == null || n < 1) return 'Enter a valid page count';
                return null;
              },
            ),
            const SizedBox(height: 24),
            Text('Status', style: Theme.of(context).textTheme.labelLarge),
            const SizedBox(height: 8),
            SegmentedButton<BookStatus>(
              segments: const [
                ButtonSegment(
                  value: BookStatus.wantToRead,
                  icon: Icon(Icons.bookmark_outline),
                  label: Text('To Read'),
                ),
                ButtonSegment(
                  value: BookStatus.reading,
                  icon: Icon(Icons.menu_book),
                  label: Text('Reading'),
                ),
                ButtonSegment(
                  value: BookStatus.finished,
                  icon: Icon(Icons.done_all),
                  label: Text('Done'),
                ),
              ],
              selected: {_status},
              onSelectionChanged: (s) => setState(() => _status = s.first),
            ),
          ],
        ),
      ),
    );
  }
}
